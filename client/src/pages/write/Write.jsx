import { useContext, useState } from "react";
import "./write.css";
import axios from "axios";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const { dispatch,user, url, isFetching } = useContext(Context);

  let userR = JSON.parse(localStorage.getItem("user"));
  let veri = true;
  if (userR) {
    // console.log(typeof(user), user.verified, "localstorage user data");
    veri = userR.verified;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "FETCH_START" });

    const callMessage = (res) => {
      toast.success(res.data.message, {
        position: "bottom-center",
        autoClose: 2500,
      });
    };
    const newPost = {
      username: user.username,
      title,
      desc,
      userId: user._id,
    };
    if (file) {
      const data = new FormData(); //JS

      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      newPost.photo = filename;
      try {
        await axios.post(`${url}/api/upload`, data);
      } catch (err) {}
    }
    try {
      const res = await axios.post(`${url}/api/posts`, newPost, {
        headers: {
          token: "bearer " + localStorage.getItem("accessToken"),
        },
      });
      callMessage(res);
      // window.location.replace("/post/" + res.data.post._id);
      // console.log(res, "res from server after success");
      dispatch({ type: "FETCH_STOP" });
      navigate(`/post/${res.data.post._id}`);
    } catch (err) {
      // console.log(err, "error message from server");
      dispatch({ type: "FETCH_STOP" });
      toast.error(`${err.response.data.message}`, {
        position: "bottom-center",
        autoClose: 2500,
      });
    }
  };
  return (
    <>
      <h1>
        {!veri && (
          <div className="infoHomePage">
            <i className="fa-solid fa-circle-exclamation"></i> Please verify
            your account using the OTP sent to your registered email to access
            all features or <Link to="/verifyotp">click here</Link>
          </div>
        )}
      </h1>
      <div className="write">
        {file && (
          <img className="writeImg" src={URL.createObjectURL(file)} alt="" />
        )}
        <form className="writeForm" onSubmit={handleSubmit}>
          <div className="writeFormGroup">
            <label htmlFor="fileInput">
              <div className="fileInputOuter">
                <i
                  className="writeIcon fa fa-picture-o "
                  aria-hidden="true"
                ></i>
              </div>
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />

            <input
              type="text"
              placeholder="Title"
              className="writeInputTitle"
              autoFocus={true}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="writeFormGroup">
            <div className="editor-container-write">
              <ReactQuill
                theme="snow"
                className="writeText"
                value={desc}
                onChange={setDesc}
              />
            </div>
            {/* <textarea
              placeholder="Tell your story..."
              type="text"
              className="writeInput writeText"
              onChange={(e) => setDesc(e.target.value)}
            ></textarea> */}
          </div>
          <button className="writeSubmit" type="submit" disabled={isFetching}>
            Publish <i className="fa-solid fa-check"></i>
          </button>
        </form>
      </div>
    </>
  );
}