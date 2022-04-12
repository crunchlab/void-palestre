import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Palestra } from 'src/app/models/struttura/palestra';
import { StrutturaService } from '../../services/api/struttura.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
    palestra: Palestra;

    constructor(private strutturaService: StrutturaService, private actRoute: ActivatedRoute) {

    }

    ngOnInit() {
        this.actRoute.params.subscribe(params => {
            this.palestra = this.strutturaService.getDetail(params.id);
            console.log(this.palestra);
        });
    }
    goToSite() {
        // let site: string = this.palestra.contatti["www"];
        // let url: URL;
        // try {
        //     if (site.match(/http[s]?:/)) {
        //         url = new URL(site);
        //     } else {
        //         url = new URL(`http://${site}`);
        //     }
        //     window.open(url, '_blank');
        // } catch (e) {
        //     alert("indirizzo non valido!")
        // }
    }
    writeTo() {
        // window.open(`mailto:${this.palestra.contatti["mail"]}`, '_blank');
    }
    phoneTo() {
        // window.open(`tel:${this.palestra.contatti["telefono"]}`, '_se_blanklf');
    }
}
