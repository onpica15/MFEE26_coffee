import { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { debounce, difference } from "lodash";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { useAuth } from "../../../../component/Member/AuthContextProvider";
import { avatarDIR, previewAPI } from "../../../../config/api-path";
import Tag from "../Tag";
import styles from "./scss/NewContent.module.scss";
import trans from "./scss/PreviewTransition.module.scss";
import MySpinner from "../MySpinner";
import { set } from "lodash";

function NewContent(props) {
    const { handleSubmit, data, setEditMode, isSubmit, escapeContent } = props;

    const { sid, nickname: member_nickname, avatar } = useAuth();
    const { tag_transition } = trans;
    const {
        wrap,
        author,
        avatar_wrap,
        info,
        nickname,
        grey_span,
        title_wrap,
        tag_wrap,
        limit,
        form_wrap,
        form_upper,
        form_bottom,
        cancel_btn,
        dis_btn,
        btn,
        plus,
    } = styles;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [preview, setPreview] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [myTag, setMyTag] = useState([]);
    const [topic, setTopic] = useState(0);

    useEffect(() => {
        if (data) {
            const { title, topic_sid, tags } = data;
            setTitle(title);
            setTopic(topic_sid);
            setContent(escapeContent);
            setMyTag(tags);
        }
    }, []);

    const sendDataDebounce = useCallback(
        debounce((val) => {
            const pattern = /[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+$/;
            const replaced = val.replace(pattern, "").trim();
            if (replaced.length === 0) {
                setPreviewData([]);
                return;
            }

            axios(previewAPI, {
                params: { queryString: replaced, type: "tag" },
            }).then((r) => {
                const rows = r.data.rows;
                const nameArray = rows.map((v) => v.name);
                // nameArray??????myTag????????????value
                const diff = difference(nameArray, myTag);

                setPreviewData(diff);
            });
        }, 150),
        [preview, myTag]
    );
    const handlePreview = (e) => {
        setPreview(e.target.value);
        sendDataDebounce(e.target.value);
    };

    const selectTag = (val) => {
        const v = val.trim();
        if (myTag.length > 5 || myTag.indexOf(val) > -1 || v === "") return;
        setPreviewData((pre) => {
            return pre.filter((el) => el !== v);
        });
        setMyTag((pre) => {
            return [...pre, v];
        });
    };

    const removeTag = (v) => {
        setMyTag((pre) => {
            return pre.filter((el) => el !== v);
        });
        setPreviewData((pre) => {
            return [...pre, v];
        });
    };

    const beDisable = useMemo(() => {
        if (content.trim() === "" || title.trim() === "") {
            return true;
        } else {
            return false;
        }
    }, [content]);

    const handleFakeData = () => {
        setTitle(`??????????????????????????? ??????!`);
        setTopic(3);
        setContent(`???????????????????????????,??????????????????,?????????????????????????????????
        ????????????????????????????????????,????????????????????????????????????????????????????????????:?????????????????????????????????,?????????????????????????????????????????????????????????????????????????????????????????????????????!

        ?????????| ???????????????,?????????????????????
        ?????????? |??????????????????????????????????????????????????????????????????????????????????????????`);
        setMyTag(["??????"]);
    };

    return (
        <div className={wrap}>
            <div className={author}>
                <div className={avatar_wrap}>
                    <img
                        src={`${avatarDIR}/${avatar || "missing-image.jpg"}`}
                        alt="avatar"
                    />
                </div>
                <div className={info}>
                    <span className={nickname}>{member_nickname}</span>
                    <span className={grey_span}>#{sid}</span>
                </div>
                {!data && (
                    <button
                        className="ms-auto"
                        style={{ cursor: "pointer", width: "4rem", opacity: 0 }}
                        onClick={() => handleFakeData()}
                    >
                        btn
                    </button>
                )}
            </div>

            <form
                name="myForm"
                className={form_wrap}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                    return false;
                }}
            >
                <div className={form_upper}>
                    <div className={title_wrap}>
                        <select
                            name="topic_sid"
                            id=""
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        >
                            <option value="1">??????</option>
                            <option value="2">??????</option>
                            <option value="3">??????</option>
                        </select>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            placeholder="???????????????"
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyPress={(e) => {
                                e.key === "Enter" && e.preventDefault();
                            }}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <textarea
                            name="content"
                            value={content}
                            aria-label="??????????????????"
                            placeholder="??????????????????"
                            onChange={(e) => {
                                if (e.target.value.length <= 500)
                                    setContent(e.target.value);
                            }}
                        />
                        <div className={tag_wrap} style={{ minHeight: "30px" }}>
                            {myTag.map((v, i) => {
                                return (
                                    <div key={i} onClick={() => removeTag(v)}>
                                        <Tag className="myTag">
                                            {v}
                                            <span className={plus}>??</span>
                                        </Tag>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={limit}>
                            <span>{content.length} /500</span>
                        </div>
                    </div>
                    <input
                        type="text"
                        name="preview"
                        placeholder="????????????"
                        value={preview}
                        onChange={(e) => handlePreview(e)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                selectTag(e.target.value);
                                setPreview("");
                            }
                        }}
                        autoComplete="off"
                    />
                    <input
                        type="text"
                        hidden
                        name="myTag"
                        value={myTag}
                        onChange={() => { }}
                    />
                    <TransitionGroup component="div" className={tag_wrap}>
                        {previewData.map((v) => {
                            return (
                                <CSSTransition
                                    timeout={500}
                                    classNames={tag_transition}
                                    key={v}
                                >
                                    <div onClick={() => selectTag(v)}>
                                        <Tag className="prevTag">
                                            {v}
                                            <span className={plus}>???</span>
                                        </Tag>
                                    </div>
                                </CSSTransition>
                            );
                        })}
                    </TransitionGroup>
                </div>
                <div className={form_bottom}>
                    {data && (
                        <button
                            className={cancel_btn}
                            onClick={() => {
                                setEditMode(false);
                            }}
                        >
                            ??????
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={beDisable}
                        className={beDisable ? dis_btn : btn}
                    >
                        ????????????
                    </button>
                </div>
                {isSubmit && <MySpinner />}
            </form>
        </div>
    );
}

export default NewContent;
