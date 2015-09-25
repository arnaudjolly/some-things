(function(){
	moment.locale("en-gb");

	var $map = $('.map-inset'),
		$labelName = $('.map-label-name'),
		$labelTime = $('.map-label-time'),
		$axisX = $('.map-axis-x'),
		$axisY = $('.map-axis-y'),
		width = $map.outerWidth(),
		height = $map.outerHeight(),
		lastCenter,
		centers = [],
		instant = moment.tz("2015-09-27 14:30", "America/Nassau");

	$(window).resize(function () {
		width = $map.outerWidth();
		height = $map.outerHeight();
	}).resize();

	function changeCenter (center) {
		if (center === lastCenter) {
			return;
		}
		if (lastCenter) {
			lastCenter.deactivate();
		}
		center.activate();
		lastCenter = center;
	}

	function Center (data) {
		this.name = data.name;
		this.x = (180 + data.long) / 360;
		this.y = (90 - data.lat) / 180;
		this.dom = $('<span>').appendTo($map).css({
			left: this.x * 100 + '%',
			top: this.y * 100 + '%'
		});
		this.m = instant.clone().tz(this.name);
	}

	function removeTroupTime ( mom ) {
		var tt = collectTroupTime();
		if (tt.error) return mom;

		return mom.clone()
				  .subtract( tt.days,    'days')
				  .subtract( tt.hours,   'hours')
				  .subtract( tt.minutes, 'minutes')
				  .subtract( tt.seconds, 'seconds');
	}

	function collectTroupTime () {
		var tt = { days: 0, hours: 0, minutes: 0, seconds: 0, error: false};

		var daysval = getNumberFromString( $('#troupDays').val() );
		tt.error = tt.error || daysval === false; 
		tt.days =  daysval || 0;

		var hoursval = getNumberFromString( $('#troupHours').val() );
		tt.error = tt.error || hoursval === false; 
		tt.hours = hoursval || 0;

		var minutesval = getNumberFromString( $('#troupMinutes').val() );
		tt.error = tt.error || minutesval === false; 
		tt.minutes = minutesval || 0;

		var secondsval = getNumberFromString( $('#troupSeconds').val() );
		tt.error = tt.error || secondsval === false; 
		tt.seconds = secondsval || 0;

		return tt;
	}

	function getNumberFromString (str) {
		return  /^[0-9]*$/.test( str ) && parseInt( str );
	}

	Center.prototype = {
		distSqr : function (x, y) {
			var dx = this.x - x,
				dy = this.y - y;
			return dx * dx + dy * dy;
		},
		activate : function () {
			var m = removeTroupTime( this.m );
			$labelName.text(this.name);
			$labelTime.text(m.format('LLLL') /* + m.zoneAbbr() */);
			$axisX.css('left', this.x * 100 + '%');
			$axisY.css('top', this.y * 100 + '%');
		},
		deactivate : function ()  {
			this.dom.removeClass('active');
		}
	};

	$.getJSON('data/moment-timezone-meta.json').then(function (data) {
		for (var name in data.zones) {
			centers.push(new Center(data.zones[name]));
		}
	});

	$('.map-inset').mousemove(function (e) {
		var offset = $(this).offset(),
			x = e.pageX - offset.left,
			y = e.pageY - offset.top,
			px = x / width,
			py = y / height,
			dist,
			closestDist = 100,
			closestCenter,
			i;

		for (i = 0; i < centers.length; i++) {
			dist = centers[i].distSqr(px, py);
			if (dist < closestDist) {
				closestCenter = centers[i];
				closestDist = dist;
			}
		}

		if (closestCenter) {
			changeCenter(closestCenter);
		}
	});

})();
