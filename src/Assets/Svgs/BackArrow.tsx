import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const BackArrow: React.FC<IconProps> = (props) => (
  <svg
    id='BackArrow'
    data-name='Layer 4 Image'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 217.45 196.03'
    {...props}
  >
    <path d='M77.63,139.14c0,8.16,0,16.32,0,24.48,0,.33.24.79-.19.98-.49.21-.68-.3-.94-.57-5.17-5.43-10.38-10.82-15.47-16.33-16.28-17.6-32.78-35-49.16-52.51-3.8-4.06-7.59-8.12-11.42-12.15-.55-.58-.63-.93-.04-1.56C20.84,59.74,41.26,37.99,61.67,16.24c4.84-5.16,9.69-10.32,14.54-15.48.16-.17.32-.35.49-.53.22-.22.5-.3.77-.19.3.11.16.41.17.63,0,1.64,0,3.28,0,4.92,0,14.6,0,29.2,0,43.8q0,1.6,1.66,1.6c6.28.02,12.55-.14,18.81.62,9.33,1.13,18.47,3.11,27.43,5.98,7.75,2.49,15.24,5.59,22.42,9.41,7.37,3.93,14.29,8.54,20.78,13.83,2.97,2.42,5.83,4.98,8.52,7.68,4.07,4.09,7.86,8.47,11.33,13.12,5.86,7.85,10.67,16.3,14.63,25.23,3.46,7.81,6.15,15.9,8.25,24.18,1.5,5.93,2.72,11.92,3.62,17.96,1.12,7.47,1.84,14.99,2.16,22.55.05,1.28.12,2.56.16,3.83,0,.24.18.61-.27.65-.37.03-.27-.31-.31-.52-2.17-10.62-6.33-20.42-12.04-29.62-4.55-7.34-9.96-13.95-16.25-19.84-4.4-4.11-9.13-7.81-14.19-11.08-6.2-4-12.74-7.37-19.58-10.14-7.3-2.95-14.8-5.21-22.48-6.93-15.3-3.43-30.81-4.55-46.45-4.4-2.32.02-4.64.05-6.96-.02-1.02-.03-1.26.31-1.26,1.29.04,8.12.02,16.24.02,24.36h-.01Z' />
  </svg>
);

export default BackArrow;
