import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";

const RecruiterProfile = () => {
  const {
    token,
    setToken,
    backendUrl,
    recruiterdata,
    setRecruiterData,
    fetchCompany,
  } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const navigate = useNavigate();

  // Load formData from recruiterdata
  useEffect(() => {
    if (recruiterdata) {
      setFormData({
        name: recruiterdata.name || "",
        phone: recruiterdata.phone || "",
        location: recruiterdata.location || "",
      });
    }
  }, [recruiterdata]);

  const updateRecruiterProfile = async () => {
    try {
      const form = new FormData();
      form.append("recruiterId", recruiterdata._id);
      form.append("name", formData.name);
      form.append("location", formData.location);
      form.append("phone", formData.phone);
      if (image) form.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/api/recruiter/update-profile`,
        form,
        {
          headers: {
            token: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        await fetchCompany(); // ✅ call it properly
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!recruiterdata) return <div className="flex justify-center items-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Recruiter Profile
          </h1>
          <div className="flex gap-4">
            <button onClick={logout}>Logout</button>
            {isEdit ? (
              <button
                onClick={updateRecruiterProfile}
                className="bg-green-400 text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>
            ) : (
              <MdEdit
                className="text-xl cursor-pointer"
                onClick={() => setIsEdit(true)}
              />
            )}
          </div>
        </div>

        {/* Profile Image */}
        <div className="mb-8 flex items-center gap-6">
          <div className="relative group">
            <img
              className={`w-32 h-32 rounded-3xl object-contain ${
                isEdit ? "border-blue-200 cursor-pointer" : "border-gray-200"
              }`}
              src={
                image
                  ? URL.createObjectURL(image)
                  : recruiterdata.image || assets.default_profile
              }
              alt="Profile"
            />
            {isEdit && (
              <>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <img
                    className="w-8 h-8"
                    src={assets.upload_icon}
                    alt="Upload"
                  />
                </div>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                  id="imageInput"
                  accept="image/*"
                />
                <label
                  htmlFor="imageInput"
                  className="absolute inset-0 cursor-pointer"
                />
              </>
            )}
          </div>
          {isEdit && (
            <p className="text-sm text-gray-500">
              Click image to upload new photo
            </p>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Full Name
            </label>
            {isEdit ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{recruiterdata.name}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Phone Number
              </label>
              {isEdit ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">
                  {recruiterdata.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Location
              </label>
              {isEdit ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">
                  {recruiterdata.location}
                </p>
              )}
            </div>
          </div>

          {/* Read-only Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                {recruiterdata.company}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{recruiterdata.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
