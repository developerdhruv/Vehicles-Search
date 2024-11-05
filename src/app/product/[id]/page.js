// app/product/[id]/page.js
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Ensure you're using the correct import

const ProductDetail = () => {
    const router = useRouter();
    const { query } = router;
    const { id } = query; // Destructure id from query

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            // Check if id is available before making the API call
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:3042/api/products/${id}`);
                    setProduct(response.data);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Failed to load product details.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProduct();
    }, [id]); // Add id as a dependency to rerun when it changes

    if (loading) return <p>Loading...</p>; // Show loading state
    if (error) return <p>{error}</p>; // Show error message if there's an error
    if (!product) return <p>No product found.</p>; // Fallback if product is null

    return (
        <div>
            <h1>{product.Name}</h1>
            <p>{product.Description}</p>
            <p>Price: ${product.Price}</p>
            <p>Category: {product.Category}</p>
            <p>Year: {product.Meta_year_start} - {product.Meta_year_end}</p>
            {product.Image_url && <img src={product.Image_url} alt={product.Name} />}
        </div>
    );
};

export default ProductDetail;
