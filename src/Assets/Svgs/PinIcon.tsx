import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const PinIcon: React.FC<IconProps> = (props) => (
  <svg
    id='PinIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 122.63 81.76'
    {...props}
  >
    <path d='M80.69,0c18.21-.36,35.11,11.55,40.23,29.1,8.78,30.14-17.48,58.3-48.08,51.68-6.12-1.32-10.81-4.13-16.21-7.03-18.16-9.76-35.96-20.22-54.14-29.94-1.97-.9-3.33-2.5-1.87-4.58C22.06,27.08,43.69,15.1,65.41,3.42,70.05,1.43,75.62.11,80.69,0ZM96.22,26.61c-10.96-11.12-30.07-6-34.05,9.02-3.76,14.2,8.44,27.76,22.93,25.33,16.06-2.69,22.67-22.63,11.12-34.35Z' />
  </svg>
);

export default PinIcon;
