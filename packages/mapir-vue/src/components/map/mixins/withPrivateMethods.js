export default {
  methods: {
    $_updateSyncedPropsFabric(prop, data) {
      return () => {
        this.propsIsUpdating[prop] = true;
        let info = typeof data === "function" ? data() : data;
        return this.$emit(`update:${prop}`, info);
      };
    },

    $_bindPropsUpdateEvents() {
      const syncedProps = [
        {
          events: ["moveend"],
          prop: "center",
          getter: this.map.getCenter.bind(this.map)
        },
        {
          events: ["zoomend"],
          prop: "zoom",
          getter: this.map.getZoom.bind(this.map)
        },
        {
          events: ["rotate"],
          prop: "bearing",
          getter: this.map.getBearing.bind(this.map)
        },
        {
          events: ["pitch"],
          prop: "pitch",
          getter: this.map.getPitch.bind(this.map)
        }
        // TODO: make 'bounds' synced prop
        // { events: ['moveend', 'zoomend', 'rotate', 'pitch'], prop: 'bounds', getter: this.map.getBounds.bind(this.map) }
      ];
      syncedProps.forEach(({ events, prop, getter }) => {
        events.forEach(event => {
          if (this.$listeners[`update:${prop}`]) {
            this.map.on(event, this.$_updateSyncedPropsFabric(prop, getter));
          }
        });
      });
    },

    $_loadMap() {
      // send map.ir load event
      fetch(`http://map.ir/vector/load?x-api-key=${this.apiKey}`, {
        method: "POST"
      }).then(_ => {
        console.log(
          "%c Map.ir %c load Event ",
          "background-color: #ff5252; color: white;",
          "background-color: black; color: white;"
        );
      });

      return this.mapboxPromise.then(mapbox => {
        this.mapbox = mapbox.default ? mapbox.default : mapbox;
        return new Promise(resolve => {
          if (this.mapboxAccessToken)
            this.mapbox.accessToken = this.mapboxAccessToken;
          let mapStyle = `${this.mapStyle}`;
          const map = new this.mapbox.Map({
            ...this._props,
            container: this.$refs.container,
            style: mapStyle,
            transformRequest: (url, resourceType) => {
              return {
                url: url,
                headers: {
                  "x-api-key": this.apiKey,
                  "Mapir-SDK": `vue/${this.vueVersion}-map/${this.componentVersion}`
                }
              };
            }
          }).addControl(
            new this.mapbox.AttributionControl({
              customAttribution: "© Map © Openstreetmap"
            })
          );
          map.on("load", () => resolve(map));
        });
      });
    },

    $_RTLTextPluginError(error) {
      this.$emit("rtl-plugin-error", { map: this.map, error: error });
    },

    $_bindMapEvents(events) {
      Object.keys(this.$listeners).forEach(eventName => {
        if (events.includes(eventName)) {
          this.map.on(eventName, this.$_emitMapEvent);
        }
      });
    },

    $_unbindEvents(events) {
      events.forEach(eventName => {
        this.map.off(eventName, this.$_emitMapEvent);
      });
    }
  }
};
