import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Upload,
  DollarSign,
  Hash,
  Type,
  Building,
  Layers,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import { fetchCategories } from "../../app/slices/CategorySlice";
import { createItem } from "../../app/slices/itemsSlice";

function AddItems() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { categories: categoryList } = useSelector((state) => state.categories);
  const { creating } = useSelector((state) => state.items);

  const [formData, setFormData] = useState({
    item_name: "",
    item_type: "",
    manufacturer: "",
    quantity: "",
    price: "",
    sku: "",
    description: "",
    category: "",
  });
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const resetForm = useCallback(() => {
    setFormData({
      item_name: "",
      item_type: "",
      manufacturer: "",
      quantity: "",
      price: "",
      sku: "",
      description: "",
      category: "",
    });
    setSelectedMainCategory("");
    setSelectedSubcategory("");
    setSelectedSubsubcategory("");
    setImageFiles([]);
    setImagePreviews([]);
  }, []);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  if (!user?.is_seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full border border-gray-200">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              You need to be registered as a seller to add items to the store.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : name === "price"
          ? value === ""
            ? ""
            : parseFloat(value)
          : value,
    }));
  };

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedMainCategory(value);
    setSelectedSubcategory("");
    setSelectedSubsubcategory("");
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubcategoryChange = (e) => {
    const value = e.target.value;
    setSelectedSubcategory(value);
    setSelectedSubsubcategory("");
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubsubcategoryChange = (e) => {
    const value = e.target.value;
    setSelectedSubsubcategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    imagePreviews.forEach(URL.revokeObjectURL);
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      item_name: formData.item_name,
      item_type: formData.item_type,
      manufacturer: formData.manufacturer,
      quantity: formData.quantity,
      price: formData.price,
      sku: formData.sku,
      description: formData.description,
      category_id: formData.category,
      image: imageFiles,
    };

    dispatch(createItem(itemData)).then((res) => {
      if (!res.error) {
        resetForm();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-md">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Add New Item
          </h1>
          <p className="text-gray-600">List your products in the marketplace</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Item Name */}
                <div className="lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4 mr-2" />
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Enter item name"
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Layers className="w-4 h-4 mr-2" />
                    Item Type *
                  </label>
                  <input
                    type="text"
                    name="item_type"
                    value={formData.item_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="e.g., Smartphone, T-shirt"
                  />
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Brand or manufacturer name"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 mr-2" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Available quantity"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 mr-2" />
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Stock Keeping Unit"
                  />
                </div>

                {/* Hierarchical Category Selection */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Layers className="w-4 h-4 mr-2" />
                      Main Category *
                    </label>
                    <select
                      value={selectedMainCategory}
                      onChange={handleMainCategoryChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    >
                      <option value="">Select main category</option>
                      {categoryList.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedMainCategory && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Layers className="w-4 h-4 mr-2" />
                        Subcategory
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={handleSubcategoryChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      >
                        <option value="">Select subcategory</option>
                        {categoryList
                          .find(
                            (cat) => cat.id === parseInt(selectedMainCategory)
                          )
                          ?.subcategories?.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {selectedSubcategory && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Layers className="w-4 h-4 mr-2" />
                        Sub-subcategory
                      </label>
                      <select
                        value={selectedSubsubcategory}
                        onChange={handleSubsubcategoryChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      >
                        <option value="">Select sub-subcategory</option>
                        {categoryList
                          .find(
                            (cat) => cat.id === parseInt(selectedMainCategory)
                          )
                          ?.subcategories?.find(
                            (sub) => sub.id === parseInt(selectedSubcategory)
                          )
                          ?.subcategories?.map((subsub) => (
                            <option key={subsub.id} value={subsub.id}>
                              {subsub.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                    placeholder="Describe your item in detail..."
                  />
                </div>

                {/* Image Upload */}
                <div className="lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors bg-gray-50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center shadow-md"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm border border-gray-300"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddItems;
