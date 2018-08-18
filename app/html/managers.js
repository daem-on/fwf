var sourceManager = new Vue({
    data: {
        sources: imported,
    },
    methods: {
        deleteItem: function(index) {
            this.sources.splice(index, 1);
        },
        addItem: function(index) {
            addItemTimeline(index);
        }
    }
})

var inspectorManager = new Vue({
    data: {
        properties: {},
    },
    methods: {
        setProperty: function(property, value) {
            var o = {};
            o[property] = value;
            timeline.changeItem(timeline.getSelection()[0].row, o);
        },
        setSeek: function() {
            seek = parseInt(this.properties.seek)
            delta = seek - (getSelected().seek | 0);
            this.setProperty("seek", seek);
            timeline.changeItem(timeline.getSelection()[0].row, {
                start: over(back(getSelected().start) + delta)
            });
        },
        removeFilter: function(index) {
            filters = this.properties.filters;
            filters.splice(index, 1);
            timeline.changeItem(timeline.getSelection()[0].row, {
                filters: filters,
            });
        }
    }
})
