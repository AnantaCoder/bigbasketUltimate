import React, { useState } from "react";

const dropdownData = [
  {
    title: "Product Rating",
    content: (
      <div className="p-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" />
          <div className="flex space-x-1 text-green-600">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
          </div>
        </label>
        <label className="flex items-center space-x-2 mt-1">
          <input type="checkbox" />
          <div className="flex space-x-1 text-green-600">
            <span>★</span><span>★</span><span>★</span><span>☆</span><span>☆</span>
          </div>
        </label>
      </div>
    ),
  },
  {
    title: "Brands",
    content: (
      <div className="p-2">
        <label className="block">
          <input type="checkbox" /> fresho!
        </label>
        <label className="block">
          <input type="checkbox" /> Hoovu Fresh
        </label>
        <label className="block">
          <input type="checkbox" /> Tadaa
        </label>
      </div>
    ),
  },
  {
    title: "Price",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Less than Rs 20</label>
        <label className="block"><input type="checkbox" /> Rs 21 to Rs 50</label>
        <label className="block"><input type="checkbox" /> Rs 51 to Rs 100</label>
        <label className="block"><input type="checkbox" /> Rs 101 to Rs 200</label>
        <label className="block"><input type="checkbox" /> Rs 201 to Rs 500</label>
        <label className="block"><input type="checkbox" /> More than Rs 500</label>
      </div>
    ),
  },
  {
    title: "Discount",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> 10% or more</label>
        <label className="block"><input type="checkbox" /> 20% or more</label>
        <label className="block"><input type="checkbox" /> 30% or more</label>
      </div>
    ),
  },
  {
    title: "Banana Varieties",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Variety A</label>
        <label className="block"><input type="checkbox" /> Variety B</label>
      </div>
    ),
  },
  {
    title: "Country Of Origin",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> India</label>
        <label className="block"><input type="checkbox" /> Imported</label>
      </div>
    ),
  },
  {
    title: "Decoration Type",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Type A</label>
        <label className="block"><input type="checkbox" /> Type B</label>
      </div>
    ),
  },
  {
    title: "Festival",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Festival A</label>
        <label className="block"><input type="checkbox" /> Festival B</label>
      </div>
    ),
  },
  {
    title: "Product Type",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Type A</label>
        <label className="block"><input type="checkbox" /> Type B</label>
      </div>
    ),
  },
  {
    title: "Seasonal",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Yes</label>
        <label className="block"><input type="checkbox" /> No</label>
      </div>
    ),
  },
  {
    title: "Pack Size",
    content: (
      <div className="p-2">
        <label className="block"><input type="checkbox" /> Small</label>
        <label className="block"><input type="checkbox" /> Medium</label>
        <label className="block"><input type="checkbox" /> Large</label>
      </div>
    ),
  },
];

function RefinedByDropdowns() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {dropdownData.map((item, index) => (
        <div key={index} className="bg-gray-100 rounded">
          <button
            onClick={() => toggleDropdown(index)}
            className="w-full text-left font-semibold p-3 flex justify-between items-center"
          >
            {item.title}
            <span className="material-icons">
              {openIndex === index ? "↑" : "↓"}
            </span>
          </button>
          {openIndex === index && (
            <div className="border-t border-gray-300">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RefinedByDropdowns;
