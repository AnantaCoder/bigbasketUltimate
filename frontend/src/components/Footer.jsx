import React from 'react';
import logo from "../assets/logo.png"; 


const SocialIcon = ({ children, href }) => (
  <a href={href} className="text-gray-400 hover:text-white transition-colors duration-300">
    {children}
  </a>
);

const FooterLink = ({ href, children }) => (
  <li className="mb-2">
    <a href={href} className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm">
      {children}
    </a>
  </li>
);

const AppStoreButton = ({ platform, href, imgSrc }) => (
    <a href={href} className="inline-block">
        <img src={imgSrc} alt={`${platform} store`} className="h-12"/>
    </a>
);


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white font-sans">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          
          {/* Logo and Contact */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
           <img 
                           src={logo} 
                           alt="BigBasket Logo" 
                           className="h-10 w-auto scale-250 transition-transform duration-200" 
                         />
            <p className="text-gray-400 text-sm">
              Geedar , Karnataka 
            </p>
          </div>

          {/* Bigbasket Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-md mb-4 uppercase tracking-wider">bigbasket</h3>
            <ul>
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">In News</FooterLink>
              <FooterLink href="#">Green bigbasket</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Affiliate</FooterLink>
              <FooterLink href="#">Terms and Conditions</FooterLink>
              <FooterLink href="#">Careers At bigbasket</FooterLink>
              <FooterLink href="#">bb Instant</FooterLink>
              <FooterLink href="#">bb Daily</FooterLink>
              <FooterLink href="#">bb Blog</FooterLink>
            </ul>
          </div>

          {/* Help Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-md mb-4 uppercase tracking-wider">Help</h3>
            <ul>
              <FooterLink href="#">FAQs</FooterLink>
              <FooterLink href="#">Contact Us</FooterLink>
              <FooterLink href="#">bb Wallet FAQs</FooterLink>
              <FooterLink href="#">bb Wallet T&Cs</FooterLink>
              <FooterLink href="#">Vendor Connect</FooterLink>
            </ul>
          </div>

          {/* App and Social */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h3 className="font-bold text-md mb-4 uppercase tracking-wider">Download Our App</h3>
            <div className="flex space-x-4 mb-6">
                <AppStoreButton 
                    platform="Google Play" 
                    href="#" 
                    imgSrc="https://www.bbassets.com/static/v2631/custPage/build/content/img/Google-App-store-icon.png"
                />
                <AppStoreButton 
                    platform="App Store" 
                    href="#"
                    imgSrc="https://www.bbassets.com/static/v2631/custPage/build/content/img/Apple-App-store-icon.png"
                />
            </div>
            <h3 className="font-bold text-md mb-4 uppercase tracking-wider">Get Social With Us</h3>
            <div className="flex space-x-5">
              <SocialIcon href="#">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0-2a7 7 0 110 14 7 7 0 010-14zm4.5-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path></svg>
              </SocialIcon>
              <SocialIcon href="#">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.94 16.55v-7.1h-1.55v7.1H8.94zm-.77-8.1c-.96 0-1.74-.78-1.74-1.74s.78-1.74 1.74-1.74c.96 0 1.74.78 1.74 1.74s-.78 1.74-1.74 1.74zm8.68 8.1h-2.2v-3.5c0-.84-.02-1.92-.9-1.92-.9 0-1.04 1.12-1.04 1.86v3.56h-2.2v-7.1h2.1v1h.03c.3-.57 1.03-1.17 2.07-1.17 2.21 0 2.62 1.45 2.62 3.33v3.94z" clipRule="evenodd" /></svg>
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 py-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            Copyright &copy; 2023-2025, YourCompany Pvt. Ltd.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm mr-4">Payment Options</span>
            <img src="https://www.livemint.com/lm-img/img/2025/09/02/600x338/Narendra_Modi_1756793096298_1756793096554_1756807011315.jpg" alt="Payment methods" className="h-6"/>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer


// To use this component in your app, you would render it like this:

