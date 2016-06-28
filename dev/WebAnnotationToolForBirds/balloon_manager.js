/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="common.ts" />
var BaloonInfo = (function () {
    function BaloonInfo() {
    }
    return BaloonInfo;
})();
var BaloonManager = (function () {
    function BaloonManager(commonInfo, element, n_ballons, pos) {
        this.seg_id_mapping = {};
        this.balloons = Array(n_ballons);
        this.basepos = pos;
        this.commonInfo = commonInfo;
        for (var i = 0; i < n_ballons; i++) {
            this.balloons[i] = new BaloonInfo();
            this.balloons[i].index = i;
            this.balloons[i].empty = true;
            this.balloons[i].html_id = "label" + i;
            //element.append("<div class='label' id='" + this.balloons[i].html_id + "'>" + this.balloons[i].html_id + "</div>");
            element.append("<div class='label' id='" + this.balloons[i].html_id + "'>" + "</div>");
        }
    }
    BaloonManager.prototype.getEmptyBaloonIndex = function () {
        for (var i = 0; i < this.balloons.length; i++) {
            if (this.balloons[i].empty) {
                return i;
            }
        }
        return null;
    };
    BaloonManager.prototype.addBalloon = function (x, y, seg_id, label) {
        // checking
        if (seg_id in this.seg_id_mapping) {
            if (this.seg_id_mapping[seg_id] != null) {
                return null;
            }
        }
        //
        var index = this.getEmptyBaloonIndex();
        if (index != null) {
            var pos = { left: 0, top: 0 };
            console.log(this.basepos);
            pos.left = this.basepos.left + x;
            pos.top = this.basepos.top + y;
            $('#' + this.balloons[index].html_id).offset(pos);
            this.balloons[index].seg_id;
            var lp = this.commonInfo.labelView.getFirstPoint(this.balloons[index].seg_id);
            console.log(this.balloons[index].seg_id);
            if (lp != null) {
                $('#' + this.balloons[index].html_id).showBalloon({ contents: "<p><img src=\"img/" + lp.label.toString() + ".jpg\" width=100 height=100></p>" });
            }
            this.balloons[index].empty = false;
            this.balloons[index].seg_id = seg_id;
            this.seg_id_mapping[seg_id] = index;
            return index;
        }
        return null;
    };
    BaloonManager.prototype.deleteBalloon = function (label_id) {
        if (label_id in this.seg_id_mapping) {
            var index = this.seg_id_mapping[label_id];
            $('#' + this.balloons[index].html_id).hideBalloon();
            this.seg_id_mapping[label_id] = null;
            this.balloons[index].empty = true;
            return index;
        }
        return null;
    };
    return BaloonManager;
})();
//# sourceMappingURL=balloon_manager.js.map