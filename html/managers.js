var sourceManager = new Vue({
    el: "#sources",
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
    el: "#inspector",
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
            this.setProperty("seek", seek);
            timeline.changeItem(timeline.getSelection()[0].row, {
                start: over(back(getSelected().start) + seek)
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
