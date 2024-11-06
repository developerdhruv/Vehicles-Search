'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

function SearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [makeSuggestions, setMakeSuggestions] = useState([]);
    const [modelSuggestions, setModelSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
    const [showModelSuggestions, setShowModelSuggestions] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState(categories);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://sql-node-api-1.onrender.com/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (keyword.length > 1) {
                try {
                    const response = await axios.get('https://sql-node-api-1.onrender.com/api/suggestions', {
                        params: { term: keyword }
                    });
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            } else {
                setShowSuggestions(false);
            }
        };
        fetchSuggestions();
    }, [keyword]);

    useEffect(() => {
        const fetchMakeSuggestions = async () => {
            if (make.length > 1) {
                try {
                    const response = await axios.get('https://sql-node-api-1.onrender.com/api/makes', {
                        params: { term: make }
                    });
                    setMakeSuggestions(response.data);
                    setShowMakeSuggestions(true);
                } catch (error) {
                    console.error("Error fetching make suggestions:", error);
                }
            } else {
                setMakeSuggestions([]);
                setShowMakeSuggestions(false);
            }
        };
        fetchMakeSuggestions();
    }, [make]);

    useEffect(() => {
        const fetchModelSuggestions = async () => {
            if (model.length > 1) {
                try {
                    const response = await axios.get('https://sql-node-api-1.onrender.com/api/models', {
                        params: { make: make }
                    });
                    setModelSuggestions(response.data);
                    setShowModelSuggestions(true);
                } catch (error) {
                    console.error("Error fetching model suggestions:", error);
                }
            } else {
                setModelSuggestions([]);
                setShowModelSuggestions(false);
            }
        };
        fetchModelSuggestions();
    }, [model]);

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('https://sql-node-api-1.onrender.com/api/products', {
                params: { make, model, year, keyword, category }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setKeyword(suggestion);
        setShowSuggestions(false);
    };

    const handleMakeClick = (make) => {
        setMake(make);
        setMakeSuggestions([]);
        setShowMakeSuggestions(false);
    };

    const handleModelClick = (model) => {
        setModel(model);
        setModelSuggestions([]);
        setShowModelSuggestions(false);
    };

    const handleMoreClick = (product) => {
        setSelectedProduct(product);
        setIsCardVisible(true);
    };
    const handleSearchChange = (e) => {
      const searchValue = e.target.value;
      setCategory(searchValue);
  
      // Filter categories based on search input
      const updatedCategories = categories.filter((cat) =>
        cat.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCategories(updatedCategories);
    };
  
    const handleOptionClick = (selectedCategory) => {
      setCategory(selectedCategory);
      setFilteredCategories(categories); // Reset list when a category is selected
    };

    const yearOptions = Array.from({ length: 65 }, (_, i) => 1960 + i); // Generate years from 1960 to 2024

    return (
      <div className="p-6 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 min-h-screen">
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-10">
          Product Search
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative w-full">
      <input
        type="text"
        value={category}
        onChange={handleSearchChange}
        placeholder="Search category..."
        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
      />
      {category && (
        <ul className="absolute mt-1 w-full bg-white border border-purple-400 rounded-lg max-h-48 overflow-y-auto z-10">
          {filteredCategories.map((cat, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(cat)}
              className="p-2 hover:bg-purple-100 cursor-pointer"
            >
              {cat}
            </li>
          ))}
          {filteredCategories.length === 0 && (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              onFocus={() => setShowMakeSuggestions(true)}
              onBlur={() => setShowMakeSuggestions(false)}
              className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-md transition-all"
            />
            {showMakeSuggestions && makeSuggestions.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto w-full">
                {makeSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleMakeClick(suggestion)}
                    className="cursor-pointer px-4 py-2 hover:bg-purple-100 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={() => setShowModelSuggestions(false)}
              className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-md transition-all"
            />
            {showModelSuggestions && modelSuggestions.length > 0 && (
              <div
                className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto w-full"
                onMouseDown={(e) => e.preventDefault()} // Prevent onBlur when selecting suggestion
              >
                {modelSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleModelClick(suggestion)}
                    className="cursor-pointer px-4 py-2 hover:bg-purple-100 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-md transition-all"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto w-full">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer px-4 py-2 hover:bg-purple-100 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg p-3 w-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {error && (
          <p className="text-red-600 mt-6 text-center font-semibold">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {searchResults.map((product) => (
            <div
              key={product.ID}
              className="border rounded-lg p-5 shadow-md bg-white hover:shadow-2xl hover:transform hover:scale-105 transition-all cursor-pointer"
            >
              <img
                src={product.Images || "https://via.placeholder.com/150"}
                alt={product.Name}
                className="w-full h-48 object-cover mb-4 rounded-lg"
              />
              <h3 className="text-xl font-bold mb-2">{product.Name}</h3>
              <p className="text-gray-600 mb-2">{product.Description}</p>
              <p className="text-lg font-semibold">{product.Price}</p>
              <button
                onClick={() => handleMoreClick(product)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg p-2 mt-4 w-full"
              >
                More Details
              </button>
            </div>
          ))}
        </div>
        {selectedProduct && isCardVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="relative bg-white rounded-lg p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-screen">
              <button
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                onClick={() => setIsCardVisible(false)}
              >
                &times;
              </button>
              <img
                src={
                  selectedProduct.Images || "https://via.placeholder.com/150"
                }
                alt={selectedProduct.Name}
                className="w-full h-64 object-cover rounded mb-6"
              />
              <h2 className="text-3xl font-bold mb-4 text-purple-800">
                {selectedProduct.Name}
              </h2>
              <p className="text-gray-800 mb-4">
                {selectedProduct.Description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <span className="font-semibold text-purple-800">SKU:</span>{" "}
                  {selectedProduct.SKU}
                </p>
                <p>
                  <span className="font-semibold text-pink-600">Price:</span> $
                  {selectedProduct.Regular_price}
                </p>
                <p>
                  <span className="font-semibold text-purple-800">
                    Categories:
                  </span>{" "}
                  {selectedProduct.Categories}
                </p>
                <p>
                  <span className="font-semibold text-pink-600">In Stock:</span>{" "}
                  {selectedProduct.In_stock ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold text-purple-800">Weight:</span>{" "}
                  {selectedProduct.Weight} kg
                </p>
                <p>
                  <span className="font-semibold text-pink-600">
                    Dimensions:
                  </span>{" "}
                  {selectedProduct.Length} x {selectedProduct.Width} x{" "}
                  {selectedProduct.Height} cm
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search results display */}
        {/* Add a section to display searchResults here */}
      </div>
    );
}

export default SearchPage;
