import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const ExpandIcon: React.FC<IconProps> = (props) => (
  <svg
    id='ExpandIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 46.07 92.09'
    {...props}
  >
    <path d='M2.84.11c2.75-.57,3.74,1.15,5.46,2.82,11.4,13.56,24.56,26.01,35.93,39.53,2.46,2.92,2.46,4.27,0,7.19-11.39,13.54-24.52,25.95-35.93,39.53-.96.78-2.02,2.44-3.23,2.76-3.59.95-6.36-2.69-4.43-5.86l36.26-40.11L.64,6.03C-.85,4.02.43.61,2.84.11Z' />
  </svg>
);

export default ExpandIcon;
