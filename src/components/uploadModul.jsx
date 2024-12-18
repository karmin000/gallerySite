import React from 'react';

const UploadModul = () => {

    const handleUpload = async (file, imageData) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }

            const user = await response.json();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', imageData.title);
            formData.append('theme', imageData.theme);
            formData.append('upload_date', imageData.upload_date);
            formData.append('user_id', user.id);
            formData.append('likes', user.likes);
            formData.append('dislikes', user.dislikes);

            const uploadResponse = await fetch('http://localhost:5000/api/images', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
            }

            alert('Image uploaded successfully');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        await handleUpload(file, formData);
        alert('Image uploaded successfully');
        setFile(null);
        setFormData({ title: '', theme: '', upload_date: new Date().toISOString().slice(0, 10) });
    };
    return (
        <form onSubmit={handleFormSubmit}>
            <div>
                <label>Image File:</label>
                <input type="file" onChange={handleFileChange} accept="image/*" required/>
            </div>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div>
                <label>Theme:</label>
                <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Theme</option>
                    <option value="Nature">Nature</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Animals">Animals</option>
                </select>
            </div>
            <div>
                <label>Upload Date:</label>
                <input
                    type="date"
                    name="upload_date"
                    value={formData.upload_date}
                    onChange={handleInputChange}
                />
            </div>
            <button type="submit">Upload</button>
        </form>
    );
};

export default UploadModul;