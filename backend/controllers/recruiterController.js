import recruiterModel from "../models/recruiterModel.js";
import jobsModel from "../models/jobsModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import applicationsModel from "../models/applicationsModel.js";
import nodemailer from "nodemailer";

const otpStore = new Map();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Verify Your Email</h2>
        <p>Your OTP for registration is:</p>
        <h1 style="color: #1C4980;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

//api to register a recruiter
export const sendOtp = async (req, res) => {
  try {
    const { name, email, password, company, location, phone } = req.body;

    // Checking for all required fields
    if (!name || !email || !password || !company || !location || !phone) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    const existingUser = await recruiterModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Company already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // ✅ Store ALL required details
    otpStore.set(email, { name, password, company, location, phone, otp, createdAt: Date.now() });

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const registerRecruiter = async (req, res) => {
  try {
    const { email, otp} = req.body;

    const user = otpStore.get(email);
    if (!user) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (otp !== user.otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() - user.createdAt > 5 * 60 * 1000) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const recruiterData = {
      name: user.name,
      email,
      password: hashedPassword,
      company: user.company,
      location: user.location,
      phone: user.phone,
    };

    const newRecruiter = new recruiterModel(recruiterData);
    const recruiter = await newRecruiter.save();
    const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });

  }catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to login a recruiter
export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking for all data to login user
    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const recruiter = await recruiterModel.findOne({ email });

    if (!recruiter) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//post a job
export const postJob = async (req, res) => {
  const {
    company,
    applicationtype,
    jobrole,
    location,
    deadline,
    jobType,
    jobtiming,
    category,
    duration,
    salary,
    experience,
    workdays,
    responsibilities,
    requirements,
  } = req.body;

  try {
    const newJob = new jobsModel({
      company,
      applicationtype,
      jobrole,
      location,
      deadline,
      jobType,
      jobtiming,
      category,
      duration,
      salary,
      experience,
      workdays,
      responsibilities,
      requirements,
      recruiter: recruiterId,
    });

    const job = await newJob.save();

    await recruiterModel.findByIdAndUpdate(
      recruiterId,
      { $push: { postedjobs: job._id } },
      { new: true } // Return the updated document
    );

    res.json({ success: true, job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//get company data
export const getCompanyData = async (req, res) => {
  try {
    const { recruiterId } = req.body;
    const recruiter = await recruiterModel
      .findById(recruiterId)
      .select("-password");
    if (!recruiter) {
      return res.json({ success: false, message: "Recruiter not found" });
    }
    res.json({ success: true, recruiter });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//update company data
export const updateCompanyData = async (req, res) => {
  try {
    const { recruiterId, name, company, location, phone } = req.body;

    await recruiterModel.findByIdAndUpdate(
      recruiterId,
      { name, company, location, phone },
      { new: true }
    );

    res.json({ success: true, message: "Profile successfully Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await jobsModel
      .find({ active: true })
      .populate({ path: "recruiter", select: "-password" });
    res.json({ success: true, jobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//get company posted jobs
export const getCompanyJobs = async (req, res) => {
  try {
    const { recruiterId } = req.body;
    const jobs = await jobsModel
      .find({ recruiter: recruiterId })
      .populate({ path: "recruiter", select: "-password" });
    res.json({ success: true, jobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//change job status
export const changeJobStatus = async (req, res) => {
  try {
    const { jobId } = req.body; // Job ID from request body
    const recruiterId = req.body.recruiterId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required.",
      });
    }

    const job = await jobsModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job.",
      });
    }

    job.active = !job.active;
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job status updated successfully.",
      job: {
        id: job._id,
        active: job.active,
        title: job.title,
        company: job.company,
      },
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the job status.",
    });
  }
};

//get job by id     //need some changes_pending......but currently working
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const job = await jobsModel
      .findById(id)
      .populate({ path: "recruiter", select: "-password" });

    if (!job) {
      return res.json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//update job details__________pending......
export const updateJob = async (req, res) => {
  try {
    const {
      jobId,
      company,
      applicationtype,
      jobrole,
      location,
      deadline,
      jobType,
      jobtiming,
      category,
      duration,
      salary,
      experience,
      workdays,
      responsibilities,
      requirements,
    } = req.body;

    await jobsModel.findByIdAndUpdate(
      jobId,
      {
        company,
        applicationtype,
        jobrole,
        location,
        deadline,
        jobType,
        jobtiming,
        category,
        duration,
        salary,
        experience,
        workdays,
        responsibilities,
        requirements,
      },
      { new: true }
    );
    res.json({ success: true, message: "Job details successfully Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//get company job aplications
export const getCompanyApplications = async (req, res) => {
  try {
    const recruiterId = req.body.recruiterId;

    const applications = await applicationsModel
      .find({ recruiterId })
      .populate("userId", "name image resume")
      .populate("jobId", "company title location date jobType salary");

    res.json({ success: true, applications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//job application status
export const jobApplicationStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    await applicationsModel.findOneAndUpdate({ _id: id }, { status });

    res.json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
