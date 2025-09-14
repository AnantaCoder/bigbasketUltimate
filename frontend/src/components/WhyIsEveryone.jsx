import React from 'react';

const BenefitCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg shadow-sm">
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-white">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
};

const WhyChooseUs = () => {
  const qualityIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const deliveryIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const onTimeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  const freeDeliveryIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  const returnIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-3 3v2m0 0v2m0 0h6a2 2 0 002-2V8a2 2 0 00-2-2h-3a2 2 0 00-2 2v2a2 2 0 01-2 2H9" />
    </svg>
  );

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Why choose bigbasket?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <BenefitCard
            icon={qualityIcon}
            title="Quality products"
            description="You can trust"
          />
          <BenefitCard
            icon={deliveryIcon}
            title="10 min delivery*"
            description="On selected locations"
          />
          <BenefitCard
            icon={onTimeIcon}
            title="On time"
            description="Guarantee"
          />
          <BenefitCard
            icon={freeDeliveryIcon}
            title="Free delivery*"
            description="No extra cost"
          />
          <BenefitCard
            icon={returnIcon}
            title="Return Policy"
            description="No Question asked"
          />
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;