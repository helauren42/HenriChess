export const BlackBoard = ({ handleClick }: { handleClick: (id: string) => void }) => {
  return (
    <div id="chessboard">
      <div id="line1" className="line">
        <span id="a-1" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-1" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-1" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-1" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-1" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-1" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-1" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-1" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line2" className="line">
        <span id="a-2" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-2" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-2" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-2" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-2" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-2" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-2" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-2" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line3" className="line">
        <span id="a-3" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-3" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-3" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-3" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-3" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-3" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-3" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-3" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line4" className="line">
        <span id="a-4" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-4" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-4" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-4" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-4" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-4" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-4" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-4" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line5" className="line">
        <span id="a-5" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-5" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-5" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-5" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-5" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-5" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-5" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-5" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line6" className="line">
        <span id="a-6" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-6" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-6" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-6" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-6" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-6" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-6" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-6" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line7" className="line">
        <span id="a-7" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-7" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-7" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-7" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-7" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-7" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-7" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-7" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
      <div id="line8" className="line">
        <span id="a-8" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="b-8" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="c-8" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="d-8" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="e-8" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="f-8" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="g-8" className="piece piece-white" onClick={(e) => handleClick(e.currentTarget.id)}></span>
        <span id="h-8" className="piece piece-black" onClick={(e) => handleClick(e.currentTarget.id)}></span>
      </div>
    </div>
  );
};

