import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const banners = [
  {
    title: "Fur-baby Feasts",
    subtitle: "Yummy food to keep your pets healthy.",
    discount: "UP TO 50% OFF",
    buttonText: "SHOP NOW",
    image: "https://www.bigbasket.com/media/uploads/banner_images/hp_m_babycare_250923_400.jpg?tr=w-1130,q-80",
  },
  {
    title: "Toys for Joy",
    subtitle: "Top picks for your furry friend.",
    discount: "STARTING AT ₹199",
    buttonText: "BUY TOYS",
    image: "https://www.bigbasket.com/media/uploads/banner_images/hp_m_petstore_250923_400.jpg?tr=w-1130,q-80",
  },
  {
    title: "Grooming Essentials",
    subtitle: "Keep pets clean and happy.",
    discount: "UP TO 35% OFF",
    buttonText: "SHOP CARE",
    image: "https://www.bigbasket.com/media/uploads/banner_images/hp_bcd_m_bcd_250923_400.jpg?tr=w-1130,q-80",
  },
  {
    title: "Pet Treats",
    subtitle: "Rewards that wag tails!",
    discount: "FLAT ₹50 OFF",
    buttonText: "EXPLORE",
    image: "https://www.bigbasket.com/media/uploads/banner_images/hp_m_health_suppliment_250923_400.jpg?tr=w-1130,q-80",
  },
];

function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative px-8 py-6">
      <div className="bg-purple-100 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between shadow relative transition-all duration-500">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{banners[current].title}</h2>
          <p className="text-sm mb-2">{banners[current].subtitle}</p>
          <p className="text-red-600 text-lg font-bold mb-4">
            {banners[current].discount}
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            {banners[current].buttonText}
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={banners[current].image}
            alt={banners[current].title}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xl font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
        >
          &lt;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xl font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  const topOffers = [
    { title: "", subtitle: "View offers >", image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/2b94a9cf-895f-460d-849a-1eee860c974c/hp_dow-topoffersStorefront_m_480_250723_01.jpg?tr=w-480,q-80" },
    { title: "", subtitle: "View offers >", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/2b94a9cf-895f-460d-849a-1eee860c974c/hp_big-packs-topoffersStorefront_m_480_250723_02.jpg?tr=w-480,q-80" },
    { title: "", subtitle: "View offers >", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/2b94a9cf-895f-460d-849a-1eee860c974c/hp_combos-topoffersStorefront_m_480_250723_03.jpg?tr=w-480,q-80"},
    { title: "", subtitle: "View offers >", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/2b94a9cf-895f-460d-849a-1eee860c974c/hp_30-corner-topoffersStorefront_m_480_250723_04.jpg?tr=w-480,q-80" },
  ];

  const fruitsVeggies = [
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/41a0810e-1fc3-46e4-9d2c-7d9e79e0aa29/hp_f&v_m_fresh-vegetables_480_250923.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/41a0810e-1fc3-46e4-9d2c-7d9e79e0aa29/hp_f&v_m_fresh-fruits_480_250923.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/41a0810e-1fc3-46e4-9d2c-7d9e79e0aa29/hp_f&v_m_cuts-&-exotics_480_250923.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/41a0810e-1fc3-46e4-9d2c-7d9e79e0aa29/hp_f&v_m_herbs-&-seasoning_480_250923.jpg?tr=w-480,q-80" },
  ];

  const dailyStaples = [
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_atta-flour-staplesStorefront_m_480_250323_01.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_rice-staplesStorefront_m_480_250323_02.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_dals-pulses-staplesStorefront_m_480_250323_03.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_cooking-oils-staplesStorefront_m_480_250323_04.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_dry-fruits-staplesStorefront_m_480_250323_05.jpg?tr=w-480,q-80" },
    { title: "", img: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/0bb0a6da-8713-48fc-a40d-93cd63ca2025/hp_salt-staplesStorefront_m_480_250323_06.jpg?tr=w-480,q-80" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Top Offers */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Top Offers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topOffers.map((offer, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate('/home')}
            >
              {offer.image && (
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="font-bold text-lg">{offer.title}</h3>
              <p className="text-sm mt-2">{offer.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fruits and Vegetables */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Fruits and Vegetables</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fruitsVeggies.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-medium text-sm">{item.title}</h3>
              <p className="text-red-600 text-xs font-bold">{item.offer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Staples */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Your Daily Staples</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {dailyStaples.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-28 h-28 object-contain mb-3 rounded-lg"
              />
              <h3 className="font-medium text-sm text-center">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Groceries & Essentials Section */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4"></h2>

        <h3 className="text-lg font-semibold mb-2">Beverages</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
          {[
            { title: "", offer: "", image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_health-drinks-&-supplements_480_250923.jpg?tr=w-480,q-80" },
            { title: "", offer: "",image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_tea-&-coffee_480_250923.jpg?tr=w-480,q-80"},
            { title: "", offer: "", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_flavoured-&-soya-milk_480_250923.jpg?tr=w-480,q-80" },
            { title: "Juices", offer: "", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_juices_480_250923.jpg?tr=w-480,q-80" },
            { title: "", offer: "" , image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_energy-drinks_480_250923.jpg?tr=w-480,q-80"},
            { title: "", offer: "", image:"https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/e4a9856b-dc3f-4927-a5a1-8edfe8d7dc38/hp_bev_m_soft-drinks-&-more_480_250923.jpg?tr=w-480,q-80" },
          ].map((item, i) => (
            <button
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-28 w-full object-contain rounded-lg mb-3"
                />
              ) : (
                <div className="h-20 bg-gray-100 rounded mb-3" />
              )}
              <h4 className="text-sm font-medium text-center">{item.title}</h4>
              <p className="text-red-600 text-xs font-bold text-center">{item.offer}</p>
            </button>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">Snacks Store</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {[
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/09ece9f7-7ac9-4d1e-afbb-f8ac572add38/hp_sbf_m_biscuits-&-namkeens_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/09ece9f7-7ac9-4d1e-afbb-f8ac572add38/hp_sbf_m_breakfast-cereals_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/09ece9f7-7ac9-4d1e-afbb-f8ac572add38/hp_sbf_m_pasta-sauces-&-more_480_270723.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/09ece9f7-7ac9-4d1e-afbb-f8ac572add38/hp_sbf_m_sweet-cravings_480_250923.jpg?tr=w-480,q-80" },
          ].map((item, i) => (
            <button
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-28 w-full object-contain rounded-lg mb-3"
                />
              ) : (
                <div className="h-24 bg-gray-100 rounded mb-3" />
              )}
            </button>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">Cleaning & Household</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/fefafda6-5ef7-4ed2-8fee-2574720666d7/hp_c&h_m_cleaners_480_250723.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/fefafda6-5ef7-4ed2-8fee-2574720666d7/hp_c&h_m_detergents-&-fabric-care_480_250723.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/fefafda6-5ef7-4ed2-8fee-2574720666d7/hp_c&h_m_paper-disposables-&-garbage-bags_480_250723.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/fefafda6-5ef7-4ed2-8fee-2574720666d7/hp_c&h_m_freshner_480_250723.jpg?tr=w-480,q-80" },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-28 w-full object-contain rounded-lg mb-3"
                />
              ) : (
                <div className="h-20 bg-gray-100 rounded mb-3" />
              )}
            </a>
          ))}
        </div>
      </section>

      {/* Beauty and Hygiene Section */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Beauty and Hygiene</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {[
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_-makeup_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_moisturiser_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_perfumes_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_mens-shaving_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_minimum-30-off_480_250923.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/50aa5fc7-cfa4-4919-b3ba-064fd9aa9441/hp_b&h_m_big-pack-bigger-saving%20bf_480_250923.jpg?tr=w-480,q-80" },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-28 w-full object-contain rounded-lg mb-3"
                />
              ) : (
                <div className="h-20 bg-gray-100 rounded mb-3" />
              )}
            </a>
          ))}
        </div>
      </section>

      {/* Home and Kitchen Section */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Home and Kitchen</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {[
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GMunder-99_m_250723_01.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GM100-199_m_250723_02.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GMStorefront-pressure-cooker_m_250723_03.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GMStorefront-stationery-store_m_250723_04.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GM-storage-container_m_250723_05.jpg?tr=w-480,q-80" },
            { image: "https://www.bigbasket.com/media/customPage/b01eee88-e6bc-410e-993c-dedd012cf04b/91e53046-98e0-4c5b-ae53-7d073e5210e1/1efc132e-4754-4359-a9a3-a9c3ec267d28/hp_GM-cleaning-needs_m_250723_06.jpg?tr=w-480,q-80" },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              style={{ borderRadius: "12px" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-28 w-full object-contain rounded-lg mb-3"
                />
              ) : (
                <div className="h-20 bg-gray-100 rounded mb-3" />
              )}
            </a>
          ))}
        </div>
      </section>

      {/* Carousel Banner Section */}
      <Carousel />
    </div>
  );
}

export default LandingPage;
