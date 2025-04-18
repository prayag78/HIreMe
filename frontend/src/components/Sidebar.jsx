import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { MdLibraryAdd } from "react-icons/md";
import { MdManageSearch } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";

const Sidebar = () => {
    const {token} = useContext(AppContext)
  return (
    <div className='min-h-screen bg-white border-r'>
        {
            token && <ul className='text-[#515151] mt-5'>
                <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary': ''}`} to={'/manage-jobs'}>
                <MdManageSearch className="w-[20px] h-[20px]" />
                    <p className='hidden md:block'>Manage Jobs</p>
                </NavLink>

                <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary': ''}`} to={'/post'}>
                <MdLibraryAdd />
                    <p className='hidden md:block'>Add Job</p>
                </NavLink>

                <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary': ''}`} to={'/applications'}>
                <RiUserAddLine />
                    <p className='hidden md:block'>View Applications</p>
                </NavLink>

                <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary': ''}`} to={'/recruiter-profile'}>
                <CgProfile className="w-[20px] h-[20px]" />
                    <p className='hidden md:block'>Profile</p>
                </NavLink>

            </ul>
        }
    </div>
  )
}

export default Sidebar