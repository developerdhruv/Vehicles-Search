'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [yearRange, setYearRange] = useState({ min: 1922, max: 2024 });
  const [productCount, setProductCount] = useState(0);

    // Existing useEffect hooks remain the same
    const handleClear = () => {
      setMake('');
      setModel('');
      setYear('');
      setKeyword('');
      setCategory('');
      setSku('');
      setSearchResults([]);
      setProductCount(0);
      setError('');
  };
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://sql-node-api-1.onrender.com/api/categories');
                const rawCategories = response.data;

                const formattedCategories = rawCategories.reduce((acc, cat) => {
                    const subCategories = cat.split(/(?:^|[^\\]),/).map(subCat => 
                        subCat.replace(/\\,/g, ',').trim()
                    );
                    return acc.concat(subCategories);
                }, []);

                const uniqueCategories = Array.from(new Set(formattedCategories));
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchMakes = async () => {
            try {
                const response = await axios.get('https://sql-node-api-1.onrender.com/api/makes', {
                    params: { term: make }
                });
                const rawMakes = response.data;
                const formattedMakes = rawMakes
                    .map(make => make.split(',').map(item => item.trim()))
                    .flat();
                const uniqueMakes = Array.from(new Set(formattedMakes));
                setMakes(uniqueMakes);
            } catch (error) {
                console.error("Error fetching makes:", error);
            }
        };
        fetchMakes();
    }, [make]);

    useEffect(() => {
      const fetchModels = async () => {
          try {
              const response = await axios.get('https://sql-node-api-1.onrender.com/api/models', {
                  params: { make: make, year }
              });
              setModels(response.data);
              
              // If current model is not in the new models list, reset model
              if (model && !response.data.includes(model)) {
                  setModel('');
              }
          } catch (error) {
              console.error("Error fetching models:", error);
          }
      };
      if (make) {
          fetchModels();
      } else {
          setModels([]);
      }
  }, [make, year]);

    useEffect(() => {
        const fetchYearRange = async () => {
            if (!make) {
                setYearRange({ min: 1922, max: 2024 });
                return;
            }

            try {
                const response = await axios.get('https://sql-node-api-1.onrender.com/api/years-range', {
                    params: { make }
                });
                const { minYear, maxYear } = response.data;
                if (minYear && maxYear) {
                    setYearRange({
                        min: parseInt(minYear),
                        max: parseInt(maxYear)
                    });
                    
                    if (year && (parseInt(year) < minYear || parseInt(year) > maxYear)) {
                        setYear('');
                    }
                }
            } catch (error) {
                console.error('Error fetching year range:', error);
            }
        };

        fetchYearRange();
    }, [make]);

    const handleSearch = async () => {
      setLoading(true);
      setError('');
      try {
          const response = await axios.get('https://sql-node-api-1.onrender.com/api/products', {
              params: { make, year, model, category, keyword, sku }
          });
          setSearchResults(response.data);
          setProductCount(response.data.length);
      } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again later.');
      } finally {
          setLoading(false);
      }
  };

    // Existing handler functions remain the same
    const handleMakeClick = (selectedMake) => {
        setMake(selectedMake);
        setModel('');
        setYear('');
    };

    const handleModelClick = (selectedModel) => {
        setModel(selectedModel);
    };

    const handleMoreClick = (product) => {
        setSelectedProduct(product);
        setIsCardVisible(true);
    };

    const yearOptions = Array.from(
        { length: yearRange.max - yearRange.min + 1 },
        (_, i) => yearRange.max - i
    );

    return (
        <div className="p-6 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 min-h-screen">
            <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-10">
                Product Search
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Part Number / SKU"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-md transition-all"
                    />
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="relative w-full">
                    <select
                        value={make}
                        onChange={(e) => handleMakeClick(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
                    >
                        <option value="">Select Make</option>
                        {makes.map((makeOption, index) => (
                            <option key={index} value={makeOption}>
                                {makeOption}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
                    >
                        <option value="">Select Year</option>
                        {yearOptions.map((yearOption) => (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full">
                    <select
                        value={model}
                        onChange={(e) => handleModelClick(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
                    >
                        <option value="">Select Model</option>
                        {models.map((modelOption, index) => (
                            <option key={index} value={modelOption}>
                                {modelOption}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="border border-purple-400 rounded-lg p-3 w-full focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-md transition-all"
                    />
                </div>
            </div>
            <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg p-3 w-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform"
                disabled={loading}
            >
                {loading ? "Searching..." : "Search"}
            </button>
            <button
                    onClick={handleClear}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg p-3 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform"
                >
                    Clear
                </button>
            {error && (
                <p className="text-red-600 mt-6 text-center font-semibold">{error}</p>
            )}
            {/* Add product count display */}
            {productCount > 0 && (
                <div className="text-center mt-4 font-semibold text-purple-800">
                    Found {productCount} {productCount === 1 ? 'product' : 'products'}
                </div>
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
                        <p className="text-sm text-gray-500 mb-2">SKU: {product.SKU}</p>
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
                            src={selectedProduct.Images || "https://via.placeholder.com/150"}
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
        </div>
    );
}

export default SearchPage;
