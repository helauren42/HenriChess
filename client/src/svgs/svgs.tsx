export const SvgAlign = () => {
  return <svg viewBox="0 0 24 24" className="stroke-(--text-color-dark) w-8 h-8" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10H21M3 14H21M3 18H21M3 6H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg >
}

export const SvgAccount = ({ className }: { className: string }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
}

export const SvgFirstPosition = ({ onClick }: { onClick: () => void }) => {
  return <svg id="first-position" className="cursor-pointer fill-(--text-color-dark)" onClick={() => onClick()} fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512" xmlSpace="preserve">
    <title>First Position</title>
    <g>
      <g>
        <g>
          <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
				c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
				z"/>
          <path d="M372.693,131.243L202.027,237.909c-13.369,8.356-13.369,27.826,0,36.181l170.667,106.667
				c14.209,8.881,32.64-1.335,32.64-18.091V149.333C405.333,132.577,386.902,122.362,372.693,131.243z M362.667,324.176L253.585,256
				l109.082-68.176V324.176z"/>
          <path d="M128,128c-11.782,0-21.333,9.551-21.333,21.333v213.333c0,11.782,9.551,21.333,21.333,21.333
				c11.782,0,21.333-9.551,21.333-21.333V149.333C149.333,137.551,139.782,128,128,128z"/>
        </g>
      </g>
    </g>
  </svg>
}

export const SvgPreviousPosition = ({ onClick }: { onClick: () => void }) => {
  return <svg id="previous-position" className="cursor-pointer fill-(--text-color-dark)" onClick={() => onClick()} fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512" xmlSpace="preserve">
    <title>Previous Position</title>
    <g>
      <g>
        <g>
          <path d="M349.009,132.945L256,210.452v-61.119c0-18.087-21.096-27.968-34.991-16.389l-128,106.667
				c-10.235,8.529-10.235,24.248,0,32.777l128,106.667C234.904,390.635,256,380.754,256,362.667v-61.119l93.009,77.508
				C362.904,390.635,384,380.754,384,362.667V149.333C384,131.246,362.904,121.365,349.009,132.945z M213.333,317.119L139.99,256
				l73.343-61.119V317.119z M341.333,317.119L267.99,256l73.343-61.119V317.119z"/>
          <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
				c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
				z"/>
        </g>
      </g>
    </g>
  </svg>
}

export const SvgNextPosition = ({ onClick }: { onClick: () => void }) => {
  return <svg id="next-position" className="cursor-pointer fill-(--text-color-dark)" onClick={() => onClick()} fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512" xmlSpace="preserve">
    <title>Next Position</title>
    <g>
      <g>
        <g>
          <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
				c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
				z"/>
          <path d="M309.973,237.909L139.307,131.243c-14.209-8.881-32.64,1.335-32.64,18.091v213.333c0,16.756,18.431,26.971,32.64,18.091
				l170.667-106.667C323.342,265.735,323.342,246.265,309.973,237.909z M149.333,324.176V187.824L258.415,256L149.333,324.176z"/>
          <path d="M384,128c-11.782,0-21.333,9.551-21.333,21.333v213.333c0,11.782,9.551,21.333,21.333,21.333
				c11.782,0,21.333-9.551,21.333-21.333V149.333C405.333,137.551,395.782,128,384,128z"/>
        </g>
      </g>
    </g>
  </svg>
}

export const SvgLastPosition = ({ onClick }: { onClick: () => void }) => {
  return <svg id="last-position" className="cursor-pointer fill-(--text-color-dark)" onClick={() => onClick()} fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512" xmlSpace="preserve">
    <title>Last Position</title>
    <g>
      <g>
        <g>
          <path d="M418.991,239.611l-128-106.667C277.096,121.365,256,131.246,256,149.333v61.119l-93.009-77.508
				C149.096,121.365,128,131.246,128,149.333v213.333c0,18.087,21.096,27.968,34.991,16.389L256,301.548v61.119
				c0,18.087,21.096,27.968,34.991,16.389l128-106.667C429.225,263.86,429.225,248.14,418.991,239.611z M170.667,317.119V194.881
				L244.01,256L170.667,317.119z M298.667,317.119V194.881L372.01,256L298.667,317.119z"/>
          <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
				c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
				z"/>
        </g>
      </g>
    </g>
  </svg>
}
