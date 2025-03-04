import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const HomeIcon: React.FC<IconProps> = (props) => (
  <svg
    id='HomeIcon'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 122.71 97.76'
    {...props}
  >
    <path d='M71.18,97.76v-29.23h-19.64v29.23h-29.59c-.13,0-1.54-.5-1.77-.62-1.56-.78-2.51-2.33-2.66-4.05l.11-37.25L61.28,19.94c.32-.05,3.26,2.42,3.78,2.84,13.43,10.9,26.57,22.17,40.01,33.05l.1,37.71c-.11,1.86-2.63,4.21-4.41,4.21h-29.59Z' />
    <path d='M85.79,17.26V1.81c0-.07.71-.94.87-1.05.47-.33,1.3-.47,1.88-.52,3.35-.29,10.86-.36,14.14.01,1.58.18,2.49,1.13,2.52,2.75l.04,30.62c.1.35.74.84,1.04,1.12,4.51,4.33,10.48,8,14.97,12.34,1.65,1.6,1.98,2.43.58,4.41s-3.36,3.83-4.91,5.63c-1.15.64-2.22.45-3.21-.34L61.44,13.21c-17.72,14.39-35.14,29.19-52.71,43.78-.99.69-2.06.7-3.08.04-.66-.43-4.15-4.66-4.77-5.53-.81-1.14-1.26-1.92-.48-3.31C18.33,32.81,36.73,17.92,54.77,2.66c4.29-3.6,8.85-3.31,13.16,0,5.79,4.44,11.3,9.78,17,14.38l.85.23Z' />
  </svg>
);

export default HomeIcon;
