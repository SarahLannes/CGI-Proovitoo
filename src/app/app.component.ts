import { Component, OnInit, Input } from '@angular/core';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { Chart } from 'chart.js';

declare var ol: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  //Muutujad
  title: string = 'CGI proovitöö';
  nimi: string = 'Sarah Lannes';
  laiuskraad: number;
  pikkuskraad: number;
  kuupaev: Date;
  alguskuupaev: Date;
  loppkuupaev: Date;
  kuupaevajarjend: Date[];
  päevapikkustejärjend: Number[];
  kuupäevadsõnena: String[];

  //Konstruktor esimese sisestuse jaoks
  sisestus(laiuskraad: number, pikkuskraad: number, kuupaev: Date) {
    this.laiuskraad = laiuskraad;
    this.pikkuskraad = pikkuskraad;
    this.kuupaev = kuupaev;
  }

  //Konstruktor teise sisestuse jaoks
  sisestus2(alguskuupaev: Date, loppkuupaev: Date) {
    this.alguskuupaev = alguskuupaev;
    this.loppkuupaev = loppkuupaev;
  }

  //Esimese submit nupu vajutamisel
  vajutamisel(laiuskraad, pikkuskraad, kuupaev) {
    this.sisestus(laiuskraad, pikkuskraad, kuupaev);
    //Päikesetõus ja päikeseloojang getSunrise() ja getSunset() abil.
    const paikesetous = getSunrise(laiuskraad, pikkuskraad, new Date(kuupaev));
    const paikeseloojang = getSunset(laiuskraad, pikkuskraad, new Date(kuupaev));
    //Päikesetõus ja loojang ekraanile.
    document.getElementById("tulemustous").innerHTML = "Sunrise: " + paikesetous.toString();
    document.getElementById("tulemusloojang").innerHTML = "Sunset: " + paikeseloojang.toString();
    //Päeva pikkuse arvutamiseks päikesetõus ja loojang millisekunditeks
    const paikesetousmillisek = paikesetous.getTime();
    const paikeseloojangmillisek = paikeseloojang.getTime();
    console.log(paikesetousmillisek, paikeseloojangmillisek);
    const paevapikkusmillisek = paikeseloojangmillisek - paikesetousmillisek;
    //Päeva pikkus millisekunditest tundideks, minutiteks ja sekunditeks.
    const paevapikkustunnid = this.millisekTunnidMinutidSekundid(paevapikkusmillisek);
    //Päeva pikkus ekraanile.
    document.getElementById("paevapikkus").innerHTML = "Lenght of the day: " + paevapikkustunnid;
    //Kaardil uue keskkoha leidmine.
    this.setCenter();

  }
  //Teise submit nupu vajutamisel
  vajutamisel2(alguskuupaev, loppkuupaev) {
    this.sisestus2(alguskuupaev, loppkuupaev);
    this.kuupaevajarjend = [];
    var vaadeldavAlgusKuupäev = new Date(this.alguskuupaev);
    const vaadeldavLõppKuupäev: Date = new Date(this.loppkuupaev);
    //Lisan kõik algus- ja lõppkuupäeva vahele jäävad kuupäevad listi.
    while (vaadeldavAlgusKuupäev <= vaadeldavLõppKuupäev) {
      this.kuupaevajarjend.push(vaadeldavAlgusKuupäev);
      vaadeldavAlgusKuupäev = new Date(vaadeldavAlgusKuupäev.setDate(vaadeldavAlgusKuupäev.getDate() + 1));
    }

    this.päevapikkustejärjend = [];
    this.kuupäevadsõnena = [];
    var i;
    //Iga kuupäeva korral leian päeva pikkuse ja lisan need eraldi listi.
    for (i = 0; i < this.kuupaevajarjend.length; i++) {
      this.päevapikkustejärjend.push(this.päevaPikkus(this.kuupaevajarjend[i]));
      this.kuupäevadsõnena.push(this.kuupaevajarjend[i].toDateString());
    }
    //Tekitan kahe listi abil graafiku.
    this.graafik();
  }

  //Millisekunditest tundideks, minutiteks ja sekunditeks.
  millisekTunnidMinutidSekundid(millisek) {
    var tunnid = Math.floor(millisek / (3600000) % 60);
    var minutid = Math.floor(millisek / (60000) % 60);
    var sekundid = Math.floor(millisek / 1000 % 60);
    //Kui tunnid on positiivne, siis tagasta tunnid, kui negatiivne, siis 24+tunnid. Sama ka minutite ja sekunditega.
    tunnid = tunnid >= 0 ? tunnid : 24 + tunnid;
    minutid = minutid >= 0 ? minutid : 60 + minutid;
    sekundid = sekundid >= 0 ? sekundid : 60 + sekundid;
    return tunnid + 'h' + " " + minutid + 'm' + " " + sekundid + 's';
  }

  //Kood pärit: https://medium.com/@balramchavan/using-openstreetmap-inside-angular-v6-3d42cbf03e57
  //Kaardi tekitamine rakendusse
  map: any;
  ngOnInit() {
    //Vaikeväärtused
    this.laiuskraad = 0;
    this.pikkuskraad = 0;
    this.kuupaev = new Date;
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.pikkuskraad, this.laiuskraad]),
        zoom: 4
      })
    });
  }

  //Uue keskkoha määramine kaardil.
  setCenter() {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.pikkuskraad, this.laiuskraad]));
    view.setZoom(5);
  }


  //Päeva pikkus tundides ligikaudselt.
  päevaPikkus(praegunekuupaev) {
    const paikesetous = getSunrise(this.laiuskraad, this.pikkuskraad, praegunekuupaev);
    const paikeseloojang = getSunset(this.laiuskraad, this.pikkuskraad, praegunekuupaev);
    const paikesetousmillisek = paikesetous.getTime();
    const paikeseloojangmillisek = paikeseloojang.getTime();
    const paevapikkusmillisek = paikeseloojangmillisek - paikesetousmillisek;
    const paevapikkustunnid = paevapikkusmillisek / 3600000;
    if (paevapikkustunnid >= 0) {
      return paevapikkustunnid;
    }
    else {
      return 24 + paevapikkustunnid;
    }
  }

  //Graafiku koodi sain siit: https://www.chartjs.org/docs/latest/
  graafik() {
    var ctx = document.getElementById('graafik');
    var graafik = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.kuupäevadsõnena,
        datasets: [{
          label: 'Päeva pikkus tundides',
          data: this.päevapikkustejärjend,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      }
    });
  }
}
