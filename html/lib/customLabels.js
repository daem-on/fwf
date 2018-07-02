// Overwrites label generation functions from timeline.js

links.Timeline.StepDate.prototype.getLabelMinor = function(options, date) {
    if (date == undefined) {
        date = this.current;
    }

    switch (this.scale) {
        case links.Timeline.StepDate.SCALE.MILLISECOND:  return String(date.getMilliseconds());
        case links.Timeline.StepDate.SCALE.SECOND:       return String(date.getSeconds()) + "s";
        case links.Timeline.StepDate.SCALE.MINUTE:
            return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
        case links.Timeline.StepDate.SCALE.HOUR:
            return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
        case links.Timeline.StepDate.SCALE.WEEKDAY:      return options.DAYS_SHORT[date.getDay()] + ' ' + date.getDate();
        case links.Timeline.StepDate.SCALE.DAY:          return String(date.getDate());
        case links.Timeline.StepDate.SCALE.MONTH:        return options.MONTHS_SHORT[date.getMonth()];   // month is zero based
        case links.Timeline.StepDate.SCALE.YEAR:         return String(date.getFullYear());
        default:                                         return "";
    }
};

links.Timeline.StepDate.prototype.getLabelMajor = function(options, date) {
    if (date == undefined) {
        date = this.current;
    }

    switch (this.scale) {
        case links.Timeline.StepDate.SCALE.MILLISECOND:
            return  this.addZeros(date.getHours(), 2) + "h" +
                this.addZeros(date.getMinutes(), 2) + "m" +
                this.addZeros(date.getSeconds(), 2) + "s";
        case links.Timeline.StepDate.SCALE.SECOND:
            return this.addZeros(date.getHours(), 2) + "h" +
                this.addZeros(date.getMinutes(), 2) + "m";
        case links.Timeline.StepDate.SCALE.MINUTE:
            return  "";
        case links.Timeline.StepDate.SCALE.HOUR:
            return  options.DAYS[date.getDay()] + " " +
                date.getDate() + " " +
                options.MONTHS[date.getMonth()] + " " +
                date.getFullYear();
        case links.Timeline.StepDate.SCALE.WEEKDAY:
        case links.Timeline.StepDate.SCALE.DAY:
            return  options.MONTHS[date.getMonth()] + " " +
                date.getFullYear();
        case links.Timeline.StepDate.SCALE.MONTH:
            return String(date.getFullYear());
        default:
            return "";
    }
};
