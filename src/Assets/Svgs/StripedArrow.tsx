import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const StripedArrow: React.FC<IconProps> = (props) => (
  <svg
    id='StripedArrow'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 124.63 50.33'
    {...props}
  >
    <path d='M99.82,0c7.24,7.74,15.51,14.86,22.65,22.64.38.41,2.15,2.28,2.16,2.64l-.23.49-24.58,24.55h-19.77l9.11-9.59h-39.06l16.06-15.69-16.06-15.47h39.06L80.05,0h19.77Z' />
    <path d='M0,40.74l15.08-15.49L0,9.59h19.77l15.44,15.49c-4.89,5.41-10.34,10.41-15.44,15.66H0Z' />
    <path d='M25.88,40.74l15.08-15.49-15.08-15.66h19.77l15.44,15.49c-4.89,5.41-10.34,10.41-15.44,15.66h-19.77Z' />
  </svg>
);

export default StripedArrow;
