/// <reference path="scripts/typings/jquery/jquery.d.ts" />

interface JQuery {
    gpFloatY?(): any;
    balloon?(options?: any): any;
    showBalloon?(options?: any): any;
    hideBalloon?(options?: any): any;
}

class BaloonInfo {
    seg_id: number;
    index: number;
    html_id: string;
    empty: boolean;
}


class BaloonManager {

    balloons: Array<BaloonInfo>;
    basepos: JQueryCoordinates;
    seg_id_mapping = {};
    constructor(element: JQuery, n_ballons: number, pos: JQueryCoordinates) {
        this.balloons = Array<BaloonInfo>(n_ballons);
        this.basepos = pos;
        for (var i = 0; i < n_ballons; i++) {
            this.balloons[i] = new BaloonInfo();
            this.balloons[i].index = i;
            this.balloons[i].empty = true;
            this.balloons[i].html_id = "label"+i;
            element.append("<div class='label' id='" + this.balloons[i].html_id + "'>" + this.balloons[i].html_id +"</div>")
        }
    }
    getEmptyBaloonIndex():number {
        for (var i = 0; i < this.balloons.length; i++) {
            if (this.balloons[i].empty) {
                return i;
            }
        }
        return null;
    }

    addBalloon(x: number, y: number, seg_id: number, label: number) {
        // checking
        if (seg_id in this.seg_id_mapping) {
            if (this.seg_id_mapping[seg_id] != null) {
                return null;
            }
        }
        //
        var index = this.getEmptyBaloonIndex();
        if (index != null) {
            var pos: JQueryCoordinates = { left: 0, top: 0 };
            console.log(this.basepos);
            pos.left = this.basepos.left + x;
            pos.top = this.basepos.top + y;
            $('#' + this.balloons[index].html_id).offset(pos);
            $('#' + this.balloons[index].html_id).showBalloon({ contents: "<p><img src=\"test.jpg\" width=100 height=100></p>" });

            this.balloons[index].empty = false;
            this.balloons[index].seg_id = seg_id;
            this.seg_id_mapping[seg_id] = index;
            return index;
        }
        return null;
    }
    deleteBalloon(label_id: number) {
        if (label_id in this.seg_id_mapping) {
            var index = this.seg_id_mapping[label_id];
            $('#' + this.balloons[index].html_id).hideBalloon();
            this.seg_id_mapping[label_id] = null;
            this.balloons[index].empty = true;
            return index;
        }
        return null;
    }
}