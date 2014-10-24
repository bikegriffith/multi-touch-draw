$(document).ready(function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		offset = $(canvas).offset(),
		mobileDevice = (window.ondevicemotion === null); // Would be undefined on other devices, not null

    var rotateInterval = 20000; //milliseconds

    var color = '#000000';

	var lines = {};

	var drawLine = function(line, x, y) {
        context.lineCap = "round";
        context.lineWidth = 10;
		context.strokeStyle = line.color;
		context.beginPath();
		context.moveTo(line.x, line.y);
		context.lineTo(x, y);
		context.stroke();

		line.x = x;
		line.y = y;
	};

    var resizeCanvas = function() {
        // Resize <canvas> element.  Must stash and redraw image
        var oldCanvas = canvas.toDataURL("image/png");
        var img = new Image();
        img.src = oldCanvas;
        img.onload = function(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            context.drawImage(img, 0, 0);
        };
		offset = $(canvas).offset();

        // Optimize element size for varying viewports
        if (window.innerHeight >= 480 && window.innerWidth >= 480) {
            $('.btn').addClass('btn-lg');
        } else {
            $('.btn').removeClass('btn-lg');
        }
    };

    var clear = function () {
        context.clearRect( 0, 0, canvas.width, canvas.height );
    };

    var _appTimer = null;
    var _rotateId = null;
    function start(id) {
        if (typeof id == 'undefined') {
            id = _rotateId;
        }
        _rotateId = id;
        if (id == 'abc') {
            rotateABC();
        } else if (id == '123') {
            rotate123();
        } else if (id == 'shapes') {
            rotateShapes();
        } else {
            setBGContent('');
        }
        scheduleNextRotation();
    }

    function setBGContent(html) {
        $('.bgcontent').html(html);
        $('.bgcontent').css({
            'font-size': (window.innerHeight*.75)+'px',
            'color': '#e5e5e5',
            'text-shadow': '0 0 3px #000',
            'line-height': window.innerHeight+'px'
        });

        clear();
        scheduleNextRotation();
    }

    function scheduleNextRotation() {
        // Check if we're auto-rotating.  If so, schedule next rotation
        clearTimeout(_appTimer);
        if (!$('.controls .rotate').hasClass('on')) {
            return;
        }
        _appTimer = setTimeout(start, rotateInterval);
    }

    function rotateABC() {
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        setBGContent(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    function rotate123() {
        var possible = "1234567890";
        setBGContent(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    function rotateShapes() {
        var possible = [
        '&#9711;'/*circle*/,
        '&#9651;'/*triangle*/,
        '&#9634;'/*square*/,
        '&#9645;'/*rectangle*/
        ];
        setBGContent(possible[Math.floor(Math.random() * possible.length)]);
    }

    (function(){
        resizeCanvas();
        $(window).on('resize', resizeCanvas);
        $(window).on('orientationchange', resizeCanvas);
        $('#options label').click(function(e){
            start($('input', this).get(0).id);
        });
        $('.controls .rotate').click(function(){
            if ($(this).hasClass('on')) {
                $(this).removeClass('on');
                clearTimeout(_appTimer);
            } else {
                $(this).addClass('on');
                start();
            }
        });
        $('#colors label').click(function(e){
            var map = {
                'black': '#000000',
                'red': '#b00000',
                'blue': '#0000b0',
                'green': '#00b000',
            };
            color = map[$(this).data('color')];
        });
        $('.btn-group').button()
    })();

	canvas.ontouchstart = function(e) {
		e.preventDefault();

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i],
				line = {
					x: touch.pageX - offset.left,
					y: touch.pageY - offset.top,
					color: color
				};
			lines[touch.identifier] = line;

			drawLine(line, line.x - 1, line.y);
		}
	};

	canvas.ontouchmove = function(e) {
		e.preventDefault();
		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i],
				line = lines[touch.identifier],
				x = touch.pageX - offset.left,
				y = touch.pageY - offset.top;

			drawLine(line, x, y);
		}
	};

	canvas.ontouchend = function(e) {
		e.preventDefault();

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			delete lines[touch.identifier];
		}
	};

	//////////////////////////////////////////////////////////
	// Code to enable mouse events to be treated as touches //
	//////////////////////////////////////////////////////////

	var counter = 0;
	var wrapMouseEvent = function(e) {
		e.changedTouches = [{
			pageX: e.pageX,
			pageY: e.pageY,
			identifier: counter
		}];
	};

	canvas.onmousedown = function(e) {
		counter++;
		wrapMouseEvent(e);
		canvas.ontouchstart(e);

		canvas.onmousemove = function(e) {
			wrapMouseEvent(e);
			canvas.ontouchmove(e);
		};
	};

	canvas.onmouseup = function(e) {
		wrapMouseEvent(e)
		canvas.ontouchend(e);
		canvas.onmousemove = null;
	};
});
