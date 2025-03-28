import React from "react";
import { useState, useEffect, useContext } from "react";
import { MapPin, Users, Calendar } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Jobs_R = () => {
  const { utoken, backendUrl , alljobs } = useContext(AppContext);
  const [rejobs, setRejobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // console.log(alljobs)  

  const handleJobClick = (jobId) => {
     navigate(`/portal/${jobId}`)
  };

  const fetchReJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `${backendUrl}/api/user/recommended-jobs`,
        {
          headers: { token: utoken },
        }
      );

      if (data.success && data.recommendations) {
        setRejobs(data.recommendations);
      } else {
        setError(data.message || "No recommendations found");
        toast.info(data.message || "No job recommendations available yet");
      }
    } catch (error) {
      setError("Failed to fetch recommendations");
      toast.error("Error fetching recommended jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (utoken) {
      fetchReJobs();
    }
  }, [utoken]);

  if (loading) {
    return <div className="p-8 m-8">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="p-8 m-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 m-8 flex flex-col">
      {/* Recommended Jobs Section */}
      <div className="m-10">
        <h2 className="text-2xl font-semibold">Recommended Jobs For You</h2>
        <p className="text-gray-600">
          Based on your profile and skills, we've selected these opportunities
          for you.
        </p>

        {rejobs.length === 0 ? (
          <div className="mt-6 text-gray-500">
            No recommendations found. Update your profile to get better matches.
          </div>
        ) : (
          <div className="grid grid-cols-3 p-2 gap-6 mt-6">
            {rejobs.map((job,index) => (
              <div
                key={index}
                className="border rounded-lg shadow-md p-2 flex justify-between h-[30vh] mt-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job.jobId)}
              >
                <div className="flex w-full">
                  <div className="m-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-gray-500">
                      {job.applicationtype}
                    </p>
                    <h3 className="text-blue-500 font-semibold">
                      {job.jobrole}
                    </h3>
                    <p className="text-gray-700">{job.company}</p>
                    <div className="flex items-center space-x-3 text-gray-600 text-sm mt-2">
                      <MapPin className="text-black" size={16} />
                      <span>{job.location}</span>
                      <Users className="text-black" size={16} />
                      <span>883 Applied</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="text-black" size={16} />
                      <span>
                        {Math.round(
                          (new Date(job.deadline) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days left
                      </span>
                    </div>
                    {job.matchReason && (
                      <p
                        className={`text-xs mt-2 ${
                          job.matchScore >= 75
                            ? "text-green-600"
                            : job.matchScore >= 60
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {job.matchReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explore Other Jobs */}
      <div className="m-10">
        <h2 className="text-2xl font-semibold">Explore Other Jobs</h2>
        <p className="text-gray-600">
          Discover more opportunities that might interest you based on your
          profile.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-6">
          {alljobs.slice(0, 3).map((job,index) => (
            <div
              key={index}
              className="border rounded-lg shadow-md p-2 flex justify-between h-[25vh] mt-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleJobClick(job._id)}
            >
              <div className="flex">
                <div className="m-2">
                  <img
                    src={assets.instagram_icon}
                    width="50"
                    alt="Company Logo"
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <p className="text-sm text-gray-500">{job.jobType}</p>
                  <h3 className="text-blue-500 font-semibold">{job.title}</h3>
                  <p className="text-gray-700">{job.company}</p>
                  <div className="flex items-center space-x-3 text-gray-600 text-sm mt-2">
                    <MapPin className="text-black" size={16} />
                    <span>{job.location}</span>
                    <Users className="text-black" size={16} />
                    <span>883 Applied</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm mt-2">
                    <Calendar className="text-gray-500" size={16} />
                    <span>
                      {Math.round(
                        (new Date(job.deadline) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jobs_R;
