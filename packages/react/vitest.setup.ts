// Canvas 2D context mock for jsdom (jsdom doesn't support HTMLCanvasElement.getContext)
HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillStyle: "",
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Array(w * h * 4).fill(0),
    }),
    putImageData: () => {},
    drawImage: () => {},
    scale: () => {},
    translate: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    strokeStyle: "",
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D;
};
