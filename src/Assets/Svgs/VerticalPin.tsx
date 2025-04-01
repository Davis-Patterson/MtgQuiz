import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const PinIcon: React.FC<IconProps> = (props) => (
  <svg
    id='PinIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 81.76 122.64'
    {...props}
  >
    <path d='M38.65.06c24.98-1.37,45.48,20.17,42.9,45.05-.6,5.83-2.48,10.81-5.11,15.97-10.22,20.01-22.35,39.11-32.66,59.09-1.41,3.3-4.43,3.29-5.83,0-10.31-19.97-22.45-39.08-32.66-59.09-1.59-3.12-2.98-6.13-3.88-9.54C-5.26,26.4,12.71,1.48,38.65.06ZM61.13,40.87c0-11.2-9.08-20.28-20.28-20.28s-20.28,9.08-20.28,20.28,9.08,20.28,20.28,20.28,20.28-9.08,20.28-20.28Z' />
  </svg>
);

export default PinIcon;
