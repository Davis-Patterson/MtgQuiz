import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const ChevronIcon: React.FC<IconProps> = (props) => (
  <svg
    id='ChevronIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 96.91 112.86'
    {...props}
  >
    <path d='M96.63,0c.42,9.8.29,19.66.12,29.49l-48.23,39.51c-2.64-1.8-5.13-3.93-7.62-5.96C27.22,51.9,13.71,40.52.08,29.32.08,19.55-.19,9.75.27,0l48.1,39.51L96.63,0Z' />
    <path d='M96.63,43.87c.42,9.8.29,19.66.12,29.49l-48.23,39.51c-2.64-1.8-5.13-3.93-7.62-5.96C27.22,95.76,13.71,84.38.08,73.18c0-9.77-.27-19.57.2-29.32l48.1,39.51,48.25-39.51Z' />
  </svg>
);

export default ChevronIcon;
