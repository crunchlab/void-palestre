import { Component, OnInit, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { get, isNil, remove, uniq } from 'lodash';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import SwiperCore, { Virtual } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { environment } from '../../../environments/environment';
import COLOR_MAP from '../../../assets/map-styles/data-points-colors.json';
import { FilterServiceProvider } from '../../services/filters/filter-service-provider.service';
import { FilterOperator } from '../../enums/filterOperator.enum';
import { MapUtilsService } from '../../services/utils/map-utils.service';
import { LngLatLike, MapboxEvent } from 'maplibre-gl';
import { ModalController } from '@ionic/angular';
import { AdvancedSearchPage } from '../advanced-search/advanced-search.page';
import { AttributeFilter } from '../../interfaces/attributeFilter.interface';
import distance from '@turf/distance';
import palestre from '../../../assets/data/palestreDigitali';
import { FeatureToPalestraService } from '../../services/transformer/feature-to-struttura.service';
import comuni from '../../../assets/data/comuni.json';
import { AboutPage } from '../about/about.page';
import { Palestra } from 'src/app/models/struttura/palestra';
SwiperCore.use([Virtual]);
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    @ViewChild('searchContainer') searchContainer: HTMLDivElement;
    @ViewChild('mapContainer') mapContainer: HTMLDivElement;
    @ViewChild('aboutBtnContainer') aboutBtnContainer: HTMLDivElement;

    @ViewChild('swiperPalestre', { static: false }) swiperPalestre: SwiperComponent;

    public homeMap: maplibregl.Map;
    public selectedFeature: any = { lngLat: [0, 0] };
    public mapStyle = environment.mapStyle;
    public palestreDigitali: FeatureCollection = (palestre as FeatureCollection);
    public comuneSelezionato: string = "";

    public strutture: Palestra[] = [];
    public comuni: string[] = [];
    public tipologie: string[] = [];
    public slidesVisible: boolean = false;
    public tipologieSelezionate: string[] = [];
    private marker: maplibregl.Marker = this.createMarker();

    public palestreCirclePaint: maplibregl.CirclePaint = {
        'circle-radius': {
            'base': 1.75,
            'stops': [
                [0, 1],
                [6, 2],
                [8, 4],
                [11, 8],
                [12, 10]
            ]
        },
        'circle-color': [
            'case',
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "ALTRA_RICETTIVITA"]],
            COLOR_MAP.tipologia.ALTRA_RICETTIVITA,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "ALBERGO"]],
            COLOR_MAP.tipologia.ALBERGO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "APPARTAMENTO"]],
            COLOR_MAP.tipologia.APPARTAMENTO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "AGRITURISMO"]],
            COLOR_MAP.tipologia.AGRITURISMO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "BED AND BREAKFAST"]],
            COLOR_MAP.tipologia.BED_AND_BREAKFAST,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "CAMPEGGIO"]],
            COLOR_MAP.tipologia.CAMPEGGIO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "AFFITTACAMERE"]],
            COLOR_MAP.tipologia.AFFITTACAMERE,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "COUNTRY HOUSE"]],
            COLOR_MAP.tipologia.COUNTRY_HOUSE,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "RESIDENCE"]],
            COLOR_MAP.tipologia.RESIDENCE,
            COLOR_MAP.palestre.DEFAULT
        ],
        'circle-stroke-color': 'transparent',
        'circle-stroke-width': 1,
        'circle-opacity': [
            'case',
            ['!', ['boolean', ['feature-state', 'isHighlighted'], true]],
            0.5,
            1
        ]
    };
    public palestreLabelLayout: maplibregl.SymbolLayout =
        {
            "visibility": "visible",
            "text-field": ["get", "palestraDigitale"
            ],
            "text-font": [
                "Open Sans Semibold",
                "Arial Unicode MS Bold"
            ],
            "text-offset": [
                0,
                0.5
            ],
            "text-anchor": "top",
            "text-size": [
                'interpolate', ['linear'], ['zoom'],
                10, 10,
                30, 24
            ]
        };
    public labelPaint: maplibregl.SymbolPaint = {

        "text-opacity": [
            'case',
            ['boolean', ['feature-state', 'isMatch'], true],
            1,
            0
        ],
        "text-color": [
            'case',
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "ALTRA_RICETTIVITA"]],
            COLOR_MAP.tipologia.ALTRA_RICETTIVITA,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "ALBERGO"]],
            COLOR_MAP.tipologia.ALBERGO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "APPARTAMENTO"]],
            COLOR_MAP.tipologia.APPARTAMENTO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "AGRITURISMO"]],
            COLOR_MAP.tipologia.AGRITURISMO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "BED AND BREAKFAST"]],
            COLOR_MAP.tipologia.BED_AND_BREAKFAST,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "CAMPEGGIO"]],
            COLOR_MAP.tipologia.CAMPEGGIO,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "AFFITTACAMERE"]],
            COLOR_MAP.tipologia.AFFITTACAMERE,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "COUNTRY HOUSE"]],
            COLOR_MAP.tipologia.COUNTRY_HOUSE,
            ['all', ['boolean', ['feature-state', 'isMatch'], true], ['==', ['get', 'tipologia'], "RESIDENCE"]],
            COLOR_MAP.tipologia.RESIDENCE,
            COLOR_MAP.palestre.DEFAULT,
        ]
    };

    constructor(private featureTransformer: FeatureToPalestraService, private filterService: FilterServiceProvider, private mapUtils: MapUtilsService, public modalController: ModalController) {
    }


    ngOnInit(): void {
        this.openAboutModal();
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        let palestre = this.palestreDigitali.features.map(feature => this.featureTransformer.featureToPalestra(feature as Feature));
        this.comuni = uniq(palestre.map((p: Palestra) => p.comune)).sort();
        // this.tipologie = uniq(strutture.map((s: Struttura) => s.tipologia)).sort();
        // this.tipologieSelezionate = [...this.tipologie];
        // this.filterService.addFilter({ property: 'tipologia', operator: FilterOperator.in, value: this.tipologieSelezionate });

    }

    ngAfterViewInit(): void {
        //sets elements height to fill viewport even if app is not fullscreen
        (this.mapContainer as any).nativeElement.style.height = `${window.innerHeight}px`;
        (this.swiperPalestre as any).elementRef.nativeElement.style.top = `calc(${window.innerHeight}px - 26vh)`;
        (this.aboutBtnContainer as any).nativeElement.style.top = `calc(${window.innerHeight}px - 48px)`;
    }

    public mapLoaded(event: any) {
        this.homeMap = event;

        this.homeMap.on('mouseenter', 'palestre-layer', () => {
            this.homeMap.getCanvas().style.cursor = 'pointer';
        });
        this.homeMap.on('mouseleave', 'palestre-layer', () => {
            this.homeMap.getCanvas().style.cursor = '';

        });

        this.homeMap.on('mouseenter', 'palestre-label-layer', () => {
            this.homeMap.getCanvas().style.cursor = 'pointer';
        });
        this.homeMap.on('mouseleave', 'palestre-label-layer', () => {
            this.homeMap.getCanvas().style.cursor = '';

        });

        this.homeMap.on('click', 'palestre-layer', (e: any) => {
            let clickedFeature = get(e, 'features[0]', null);
            if (!isNil(clickedFeature) && clickedFeature.state.isMatch) {
                this.handleLayerClick(clickedFeature);
            }
        });
        this.homeMap.on('click', 'palestre-label-layer', (e: any) => {
            let clickedFeature = get(e, 'features[0]', null);
            if (!isNil(clickedFeature) && clickedFeature.state.isMatch) {
                this.handleLayerClick(clickedFeature);
            }
        });

        event.resize();
        let filterCoordinates: LngLatLike[] = this.palestreDigitali.features.map(f => (f.geometry as any).coordinates);
        this.fitResultsBBox(filterCoordinates);
    }


    public onDragEnd(evt: MapboxEvent<MouseEvent | TouchEvent | WheelEvent> & maplibregl.EventData) {
        let isHuman = get(evt, 'originalEvent.isTrusted', true);
        if (isHuman) {
            this.refreshSlides();
        }

    }
    public mapZoomEnd(evt: MapboxEvent<MouseEvent | TouchEvent | WheelEvent> & maplibregl.EventData) {
        let isHuman = get(evt, 'originalEvent.isTrusted', true);
        if (isHuman) {
            this.refreshSlides();
        }
    }
    private refreshSlides() {
        let mapCenter = [this.homeMap.getCenter().lng, this.homeMap.getCenter().lat];
        let renderedFeatures: maplibregl.MapboxGeoJSONFeature[] = this.homeMap
            .queryRenderedFeatures(null, { "layers": ["palestre-layer"] })
            .sort((f1: any, f2: any) => {
                let f1ToCenter = distance(mapCenter, f1.geometry.coordinates);
                let f2ToCenter = distance(mapCenter, f2.geometry.coordinates);
                return f1ToCenter - f2ToCenter;
            })
        let filteredFeatures = this.filterService.applyFilters(renderedFeatures, "properties");
        let filterdIds: number[] = filteredFeatures.map(f => f.id);

        renderedFeatures.map(f => {
            let isMatch = filterdIds.includes(f.properties.id);
            this.homeMap.setFeatureState({ source: 'palestre', id: f.properties.id }, { "isMatch": isMatch });
        });
        if (this.homeMap.getZoom() > 10) {
            this.strutture = filteredFeatures
                .map((feature: Feature) => this.featureTransformer.featureToPalestra(feature));

            this.swiperPalestre.swiperRef.virtual.removeAllSlides();
            this.swiperPalestre.swiperRef.updateSlides();
            this.swiperPalestre.swiperRef.virtual.update(true);
            if (this.strutture.length) {
                this.swiperPalestre.swiperRef.slideTo(0);
            }

        } else {
            this.strutture = [];
        }
    }


    private fitResultsBBox(filterCoordinates: maplibregl.LngLatLike[]) {
        let paddingObject = {
            top: (this.searchContainer as any).nativeElement.getBoundingClientRect().height + 100,
            left: 50,
            right: 50,
            bottom: (this.swiperPalestre as any).elementRef.nativeElement.getBoundingClientRect().height + 100
        };
        this.homeMap
            .fitBounds(this.mapUtils.getLatLngBounds(filterCoordinates), { padding: paddingObject });
    }

    private handleLayerClick(clickedFeature: Feature<Geometry, { [name: string]: any; }>) {
        let slideIdx = this.strutture.findIndex(s => s.id === clickedFeature.id);
        this.setMarker(this.strutture[slideIdx], (clickedFeature.geometry as any).coordinates);

        this.swiperPalestre.swiperRef.slideTo(slideIdx, 1200);
    }

    public searchComune(term: string = "", comune: string) {
        term = term.toLowerCase();
        return comune.toLowerCase().replace(' ', '').indexOf(term) > -1;

    }

    /**
     * zooms in map to selected city
     * @param searchTerm string: comune cercato
     */
    public onComuneChange(searchTerm: string = "") {
        let comune = comuni.find(c => c.name.toUpperCase() === searchTerm.toUpperCase());
        let filterCoordinates: LngLatLike = [comune.long, comune.lat];
        let easeOptions: any = {
            center: filterCoordinates,
            duration: 1200
        };
        if (this.homeMap.getZoom() < 13) {
            easeOptions.zoom = 13;
        }
        this.homeMap.easeTo(easeOptions);
    }

    public onChipClick(tipologia: string) {
        if (this.tipologieSelezionate.includes(tipologia)) {
            remove(this.tipologieSelezionate, t => t == tipologia);
            if (!this.tipologieSelezionate.length) {
                this.tipologieSelezionate = [...this.tipologie];
            }
        } else {
            this.tipologieSelezionate.push(tipologia);
        }
        this.filterService.addFilter({ property: 'tipologia', operator: FilterOperator.in, value: this.tipologieSelezionate });
        this.refreshSlides();
    }

    private createMarker(color: string = 'red'): maplibregl.Marker {
        const el = document.createElement('div');
        el.className = 'marker-container';
        const markerDiv = document.createElement('div');
        markerDiv.className = 'marker';
        el.appendChild(markerDiv);
        let marker: maplibregl.Marker = new maplibregl.Marker({ color: color });

        return marker;
    }

    public onUserLocationClick() {
        let geoSuccess = evt => {
            // console.log(evt);
            let lng = evt.coords.longitude;
            let lat = evt.coords.latitude;

            let easeOptions: any = {
                center: [lng, lat],
                duration: 1200
            };
            if (this.homeMap.getZoom() < 13) {
                easeOptions.zoom = 13;
            }
            this.homeMap.easeTo(easeOptions);
        };
        let geoError = err => console.error(err);
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

    }

    public onSlideChange(event: any) {
        let index = event.activeIndex;
        let struttura = this.strutture[index];
        if (!isNil(struttura)) {
            let geojsonPoint = this.palestreDigitali.features.find(f => f.properties.id == struttura.id);
            const coordinates = get(geojsonPoint, 'geometry.coordinates', []).slice();
            this.setMarker(struttura, coordinates);
            this.homeMap.panTo(coordinates, { duration: 250 });
        }
    }

    private setMarker(struttura: Palestra, coordinates: any) {
        this.marker.remove();
        // let color: string = get(COLOR_MAP, `tipologia[${struttura.tipologia.replaceAll(' ', '_').toUpperCase()}]`, COLOR_MAP.tipologia.ALTRA_RICETTIVITA);
        let color: string = COLOR_MAP.palestre.DEFAULT;
        this.marker = this.createMarker(color);
        this.marker
            .setLngLat(coordinates)
            .addTo(this.homeMap);
    }

    async openSearchModal() {
        const modal = await this.modalController.create({
            component: AdvancedSearchPage,
            cssClass: 'monithon-about-modal'
        });

        modal.onDidDismiss().then((modalData) => {
            if (modalData !== null) {
                let filters: AttributeFilter[] = get(modalData, 'data.filters', []);
                filters.map((f: AttributeFilter) => this.filterService.addFilter(f));
                this.refreshSlides();
            }
        });

        return await modal.present();
    }

    async openAboutModal() {
        const modal = await this.modalController.create({
            component: AboutPage,
            cssClass: 'monithon-about-modal'
        });

        return await modal.present();
    }
}

