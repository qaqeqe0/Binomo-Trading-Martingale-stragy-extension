import React, { useEffect, useState } from 'react'
import parse from 'html-react-parser';
import { HTMLReactParserOptions, Element } from 'html-react-parser';

const Option: React.FC<{}> = () => {

  return (
    <div _ngcontent-ayc-c279="" className="option">
      <span _ngcontent-ayc-c279="" className="badge">1</span>
      <span _ngcontent-ayc-c279="" className="assets">Crypto IDX</span>
      <span _ngcontent-ayc-c279="" className="currency">₫0</span>
      <button _ngcontent-ayc-c279="" className="close">
        {parse(`<vui-icon _ngcontent-ayc-c279="" name="close" size="24" class="icon_host__2j6dP hydrated"><svg class="icon_icon__2rH5D" style="width: 24px; height: 24px;">
							<use xlink:href="/assets/sprite/close-l2.svg#close-l2"></use>
						</svg>
					</vui-icon>`)}
      </button>
    </div>
  )
}

// win - class win1
// win - option win
const ToastMain: React.FC<{}> = () => {

  return (
    <>
      {parse(`<option-animation _ngcontent-ayc-c279="" _nghost-ayc-c278="">
					<lottie-player _ngcontent-ayc-c278="" renewlottieinstance="" autoplay="" class="lose" background="transparent"></lottie-player>
				</option-animation>`)}
      <Option />
    </>
  )
}



export default ToastMain
