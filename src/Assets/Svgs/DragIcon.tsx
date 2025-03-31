import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const DragIcon: React.FC<IconProps> = (props) => (
  <svg
    id='DragIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 196.8 196.29'
    {...props}
  >
    <polygon points='196.8 85.9 0 85.9 0 61.54 .36 61.18 196.44 61.18 196.8 61.54 196.8 85.9' />
    <polygon points='196.8 110.38 196.8 134.74 196.44 135.1 .36 135.1 0 134.74 0 110.38 196.8 110.38' />
    <polygon points='135.12 36.7 61.68 36.7 98.49 0 135.12 36.7' />
    <polygon points='135.12 159.58 98.49 196.29 61.68 159.58 135.12 159.58' />
  </svg>
);

export default DragIcon;
