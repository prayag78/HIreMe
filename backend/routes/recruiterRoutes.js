import express from 'express';
import { registerRecruiter,getJobApplicants, loginRecruiter, postJob, getCompanyData, updateCompanyData, getJobs, getJobById, getCompanyJobs, updateJob, changeJobStatus, getCompanyApplications, sendOtp , getActiveJobs , getActiveInternships , deleteJob} from '../controllers/recruiterController.js';
import {acceptRejectApplication} from '../controllers/recruiterController.js';
import authRecruiter from '../middleware/authRecruiter.js';
import upload from '../middleware/multer.js';


const recruiterRouter = express.Router();

recruiterRouter.post('/register', registerRecruiter);
recruiterRouter.post('/send-otp', sendOtp);
recruiterRouter.post('/login', loginRecruiter);
recruiterRouter.post('/post-job',authRecruiter ,postJob);
recruiterRouter.get('/jobs' ,getJobs); //get all jobs
recruiterRouter.get('/active-jobs' ,getActiveJobs); //get all active jobs
recruiterRouter.get('/active-internships' ,getActiveInternships); //get all active internships
recruiterRouter.get('/company-jobs',authRecruiter ,getCompanyJobs);   //get company posted jobs
recruiterRouter.put('/change-job-status',authRecruiter ,changeJobStatus);
recruiterRouter.get('/job/:id', getJobById);  //get job by id                 need to check after posted more jobs
recruiterRouter.get('/company-data',authRecruiter ,getCompanyData);
recruiterRouter.post("/update-profile",upload.single("image"),updateCompanyData);
recruiterRouter.get('/get-applicants',authRecruiter ,getCompanyApplications);
recruiterRouter.get('/get-job-applicants',authRecruiter ,getJobApplicants);
recruiterRouter.put('/update-job',authRecruiter ,updateJob);
recruiterRouter.put('/update-application-status',authRecruiter ,acceptRejectApplication);
recruiterRouter.delete('/delete-job/:jobId', authRecruiter, deleteJob);

export default recruiterRouter;