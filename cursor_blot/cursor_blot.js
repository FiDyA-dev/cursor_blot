const cursorBlot = new class {
    color = '#000000'

    init() {
        if (document.getElementById('cursorCanvasOverlay')) {
            return;
        }

        let blot = this;
        let cursorPositions = [];
        let mouseOut = true;

        function cursorObservation() {
            window.addEventListener('mousemove', e => {
                mouseOut = false;
                const target = e.target;
                if (!target) {
                    return;
                }

                let pageScrollPos = getPageScrollPosition();

                cursorPositions.unshift({
                    x: e.pageX - pageScrollPos.x,
                    y: e.pageY - pageScrollPos.y
                });

                while (cursorPositions.length > 10) {
                    cursorPositions.pop();
                }
            })
            window.addEventListener('mouseout', () => {
                mouseOut = true;
            })
        }

        cursorObservation();

        const canvas = document.createElement("canvas");
        canvas.id = 'cursorCanvasOverlay';
        document.body.append(canvas);
        let context = canvas.getContext('2d');

        const bufferCanvas = document.createElement("canvas");
        let bufferContext = bufferCanvas.getContext('2d');

        setCanvasSize();
        window.addEventListener("resize", setCanvasSize);

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height
        }

        const animationDuration = 20;
        let animationTimeStump;

        function drawCursor(timeStump) {
            if (cursorPositions.length <= 0) {
                context.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                window.requestAnimationFrame(drawCursor);
                return;
            }

            if (!animationTimeStump) {
                animationTimeStump = timeStump;
            }

            let firstPos = cursorPositions[0];

            bufferContext.fillStyle = blot.color;
            bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

            bufferContext.beginPath();
            bufferContext.arc(firstPos.x, firstPos.y, 10, 0, 2 * Math.PI);
            bufferContext.fill();

            let prevPos = firstPos;
            bufferContext.lineCap = "round";
            bufferContext.strokeStyle = blot.color;
            for (let i = 1; i < cursorPositions.length; i++) {
                let pos = cursorPositions[i];
                bufferContext.lineWidth = 20 - i;

                bufferContext.beginPath();
                bufferContext.moveTo(prevPos.x, prevPos.y);
                bufferContext.lineTo(pos.x, pos.y);
                bufferContext.stroke();

                prevPos = pos;
            }

            //drawContour();

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bufferCanvas, 0, 0);

            if (
                (cursorPositions.length > 1 || mouseOut) &&
                timeStump - animationTimeStump >= animationDuration
            ) {
                cursorPositions.pop();
                animationTimeStump = timeStump;
            }
            window.requestAnimationFrame(drawCursor);
        }

        function getPageScrollPosition() {
            let doc = document.documentElement;
            return {
                x: (scrollX || doc.scrollLeft) - (doc.clientLeft || 0),
                y: (scrollY || doc.scrollTop) - (doc.clientTop || 0),
            };
        }

        window.requestAnimationFrame(drawCursor);
    }

    setColor(color) {
        this.color = color;
    }
}

cursorBlot.init()
