import React, { useState } from 'react'
import { assets, ownerMenuLinks } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const { user, axios, fetchUser } = useAppContext()
  const location = useLocation()
  const [image, setImage] = useState('');

  const updateImage = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const { data } = await axios.post('/api/owner/update-image', formData);

      if (data.success) {
        fetchUser();
        toast.success(data.message);
        setImage('')
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (

    <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm'>

      <div className='group relative w-14 md:w-20 mx-auto'>
        <label htmlFor="image" className='cursor-pointer block'>
          <img src={image ? URL.createObjectURL(image) : user?.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"} alt="" className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover block' />
          <input type="file" id='image' accept='image/*' hidden onChange={e => setImage(e.target.files[0])} />
          <div className='absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-150'>
            <img src={assets.edit_icon} alt="" className='h-5 w-5' />
          </div>
        </label>
      </div>


      {image && (
        <div className='mt-3'>
          <button onClick={updateImage} className='flex items-center mx-auto p-2 gap-2 bg-primary/10 text-primary rounded-md cursor-pointer shadow-sm'>
            <span>Save</span>
            <img src={assets.check_icon} width={13} alt="" />
          </button>
        </div>
      )}
      <p className='mt-2 text-base md:block text-center text-gray-700 relative z-10'>{user?.name}</p>

      <div className='w-full'>
        {ownerMenuLinks.map((link, index) => (
          <NavLink key={index} to={link.path} className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}>

            <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt="car icon" />

            <span className='max-md:hidden'>{link.name}</span>

            <div className={`${link.path === location.pathname && 'bg-primary'} w-1.5 h-8 rounded-l right-0 absolute`}></div>
          </NavLink>
        ))}
      </div>
    </div>

  )
}

export default Sidebar




// import React, { useState, useEffect, useRef } from 'react'
// import { assets, dummyCarData, ownerMenuLinks } from '../../assets/assets'
// import { NavLink, useLocation } from 'react-router-dom'

// export default function Sidebar() {
//   const user = dummyCarData
//   const location = useLocation()

//   // savedImage is what persists after the user clicks "Save"
//   const [savedImage, setSavedImage] = useState(user?.image || null)
//   // selectedFile holds the File object from the input until saved or cancelled
//   const [selectedFile, setSelectedFile] = useState(null)
//   // previewUrl is the temporary object URL used for previewing
//   const [previewUrl, setPreviewUrl] = useState(null)

//   const fileInputRef = useRef(null)

//   // create/revoke object URL for the preview when the selected file changes
//   useEffect(() => {
//     if (!selectedFile) {
//       setPreviewUrl(null)
//       return
//     }
//     const url = URL.createObjectURL(selectedFile)
//     setPreviewUrl(url)

//     return () => {
//       URL.revokeObjectURL(url)
//     }
//   }, [selectedFile])

//   // decide which image src to show: preview (new file) > saved > fallback
//   const fallback = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"
//   const avatarSrc = previewUrl || savedImage || fallback

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0]
//     if (file) setSelectedFile(file)
//   }

//   const handleSave = () => {
//     // Persist the preview URL as "saved" image (in a real app you'd upload)
//     if (previewUrl) {
//       setSavedImage(previewUrl)
//       setSelectedFile(null)
//       // previewUrl will be revoked by effect cleanup, but savedImage references the same blob URL
//       // in a real app you'd upload and use the server URL instead
//     }
//   }

//   const handleCancel = () => {
//     setSelectedFile(null)
//   }

//   return (
//     <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm'>

//       {/* Avatar area */}
//       <div className='w-full flex flex-col items-center'>
//         <div className='group relative inline-block'>
//           <label
//             htmlFor='image'
//             className='relative block cursor-pointer rounded-full overflow-hidden focus:outline-none ring-2 ring-transparent focus-within:ring-primary/40'
//             aria-label='Change profile picture'
//           >
//             <img
//               src={avatarSrc}
//               alt={user?.name || 'avatar'}
//               className='h-12 md:h-14 w-12 md:w-14 rounded-full mx-auto object-cover'
//             />

//             {/* hidden input */}
//             <input
//               ref={fileInputRef}
//               type='file'
//               id='image'
//               accept='image/*'
//               hidden
//               onChange={onFileChange}
//             />

//             {/* overlay when hovering the avatar */}
//             <div className='absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full'>
//               <div className='p-2 bg-white/90 rounded-full'>
//                 <img src={assets.edit_icon} alt='edit' className='h-4 w-4' />
//               </div>
//             </div>
//           </label>

//           {/* Save / Cancel controls appear when a new file is selected */}
//           {previewUrl && (
//             <div className='absolute right-0 -bottom-2 flex gap-2 items-center'>
//               <button
//                 onClick={handleSave}
//                 className='flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs shadow-sm'
//                 aria-label='Save profile picture'
//               >
//                 Save
//                 <img src={assets.check_icon} width={13} alt='save' />
//               </button>

//               <button
//                 onClick={handleCancel}
//                 className='text-xs px-3 py-1 rounded-full bg-white/90 border border-gray-200 shadow-sm'
//                 aria-label='Cancel'
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         <p className='mt-2 text-base max-md:hidden'>{user?.name}</p>
//       </div>

//       {/* Menu links */}
//       <div className='w-full mt-6'>
//         {ownerMenuLinks.map((link, index) => (
//           <NavLink
//             key={index}
//             to={link.path}
//             className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
//           >
//             <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt="car icon" />

//             <span className='max-md:hidden'>{link.name}</span>

//             <div className={`${link.path === location.pathname ? 'bg-primary' : ''} w-1.5 h-8 rounded-l right-0 absolute`}></div>
//           </NavLink>
//         ))}
//       </div>
//     </div>
//   )
// }
