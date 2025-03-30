import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const DropdownIcon: React.FC<IconProps> = (props) => (
  <svg
    id='DropdownIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 116.93 66.38'
    {...props}
  >
    <path d='M57.21.08c2.39-.32,4.59.36,6.53,1.73,17.46,18.08,34.79,36.28,51.98,54.63,2.93,4.06.21,9.59-4.66,9.95H5.87c-4.81-.42-7.43-5.51-4.86-9.67C16.84,40.08,32.32,23.01,48.39,6.6c2.44-2.49,5.22-6.04,8.81-6.52Z' />
  </svg>
);

export default DropdownIcon;
