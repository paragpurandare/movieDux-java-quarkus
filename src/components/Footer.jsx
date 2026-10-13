// export default function Footer() {
//   return (
//     <footer className="site-footer">
//       <p>
//         MovieDux — Discover your next favourite movie.
//       </p>
//     </footer>
//   );
// }




//Ant Design v1
import { Typography } from 'antd';

const { Text } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Text className="footer-text">
        © {currentYear} MovieDux. All rights reserved.
      </Text>
    </footer>
  );
};

export default Footer;

// import React from 'react';
// import '../styles.css';

// const Footer = () => {

//     const currentYear = new Date().getFullYear();

//     return(
//         <footer className='footer'>
//             <p className='footer-text'> 
//             © {currentYear} Moviedux, All rights reserved.
//             </p>
//         </footer>
//     );
// }

// export default Footer;