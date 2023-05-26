console.log("articleDetail.js 로드됨");
let article_id = new URLSearchParams(window.location.search).get("article_id");
const token = localStorage.getItem("access");

// 글 수정 페이지 이동
function articleUpdate(article_id) {
	window.location.href = `${frontend_base_url}/articles/update_article.html?article_id=${article_id}`;
}

async function loadComments(article_id) {
	const response = await getArticleComments(article_id);
	const payload = JSON.parse(localStorage.getItem("payload"));
	if (payload) {
		currentUserId = payload.nickname;
	} else {
		currentUserId = null;
	}
	const commentsList = document.getElementById("comments-list");
	commentsList.innerHTML = "";

	// 댓글안에 링크찾아다가 하이퍼링크로 바꿔주기
	function linkify(text) {
		const urlRegex = /(((https?:\/\/)|www\.)[^\s]+(\([^\s]+\)|[^\s.,!?:;\"'<>()\[\]\\/]|\/))/gi;
		return text.replace(urlRegex, function (url) {
			const href = url.startsWith("http") ? url : "http://" + url;
			const linkName = "🔗";
			return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="custom-link">${linkName}</a>`;
		});
	}
	console.log(response)
	response.forEach(async (comment) => {
		console.log(comment)
		let buttons = '';

		// 프로필 사진 넣기 위한 부분(있으면 그대로 넣고 없으면 대체 이미지)
		const comment_user = await getOtherUser(comment.user_id)
		if (comment_user.avatar) {
			comment_user_avatar = comment_user.avatar
		} else {
			comment_user_avatar = "../static/image/free-icon-music-6599985.png"
		}

		// 로그인 한 유저와 댓글 작성자가 같으면 수정, 삭제 버튼 보이게 하기
		if (currentUserId === comment.user && !response[0]) {
			buttons = `
            <div class="col d-grid gap-2 d-md-flex justify-content-end p-2 text-nowrap ">
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="modifyComment(${comment.id}, '${comment.comment}')">수정</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="deleteComment(${comment.id})">삭제</button>
            
            `;
		} else {
			buttons = `
			<div class="col d-grid gap-2 d-md-flex justify-content-end p-2 text-nowrap ">
			<section class="like-i">
			<span class="like-i2">
				<button class="like-i3" id="like-button" type="button"
					onclick="likeClick(${comment.id})">
					<div class="bi-heart2" id="like">
						<span class="like" id="like-${comment.id}" style="display:none;">
							<svg aria-label="좋아요 취소" class="x1lliihq x1n2onr6" color="rgb(255, 48, 64)"
								fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48"
								width="24">
								<title>좋아요 취소</title>
								<path
									d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z">
								</path>
							</svg>
						</span>
						<span class="dislike" id="dislike-${comment.id}" style="display:flex;">
							<svg aria-label="좋아요" class="x1lliihq x1n2onr6" color="rgb(38, 38, 38)"
								fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24"
								width="24">
								<title>좋아요</title>
								<path
									d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z">
								</path>
							</svg>
						</span>
					</div>
				</button>
			</span>
		</section>
		</div>`;
		}
		commentsList.innerHTML += `
        <li class="media d-flex align-items-center mt-2 mb-2 mr-2 border border-dark rounded">
		<img class="img-thumbnail rounded-circle" src=${comment_user_avatar} alt="profile img" width="50" height"50">
		<div class="media-body">
			<h6 class="mt-1 mb-1 ms-1 me-1">${comment.user}</h6>
			<span class="mt-1 mb-1 ms-1 me-1" style="word-break: break-all; white-space: pre-line;">${linkify(comment.comment)}</span> <!-- 이 부분을 수정하여 링크 변환을 반영 -->
		</div>
            ${buttons}
        </li >
			`;

		const login_user = await getLoginUser();
		//좋아요 하트색 세팅
		let like = document.getElementById(`like-${comment.id}`)
		let dislike = document.getElementById(`dislike-${comment.id}`)
		login_user.like_comments.forEach((obj) => {
			if (comment.id == obj.id) {
				like.setAttribute("style", "display:flex;")
				dislike.setAttribute("style", "display:none;")
			}
		});
	});
}

// 게시글 상세보기 페이지가 로드될 때 실행되는 함수
window.onload = async function () {
	const login_user = await getLoginUser();
	// 게시글 받아오기
	const article = await getArticle(article_id);

	// 내용 가져오기
	document.getElementById("detail-title").innerText = "제목 " + article.title;
	document.getElementById("detail-user").innerText = "작성자 " + article.owner.nickname;
	document.getElementById("detail-time").innerText = "작성일 " + article.created_at.substr(
		0,
		10
	);
	document.getElementById("detail-content").innerText = article.content;

	const imageBox = document.createElement("img");
	imageBox.setAttribute("class", "img-box");
	const articlePhoto = article.photos[0]?.file;
	// 이미지 가져오기
	if (articlePhoto) {
		imageBox.setAttribute("src", `${articlePhoto} `);
	} else {
		imageBox.setAttribute(
			"src",
			"https://cdn11.bigcommerce.com/s-1812kprzl2/images/stencil/original/products/426/5082/no-image__12882.1665668288.jpg?c=2"
		);
	}
	document.getElementById("detail-img").append(imageBox);
	if (login_user.id === article.owner.id) {
		const articleButtons = document.getElementById("btns");
		const updateButton = document.createElement("button");
		const deleteButton = document.createElement("button");
		updateButton.setAttribute("class", "btn");
		updateButton.setAttribute("type", "button");
		updateButton.innerText = "수정하기";
		updateButton.setAttribute("onclick", `articleUpdate(article_id)`);
		deleteButton.setAttribute("class", "btn p-0");
		deleteButton.setAttribute("type", "button");
		deleteButton.innerText = "삭제하기";
		deleteButton.setAttribute("onclick", `articleDelete(article_id)`);
		articleButtons.appendChild(updateButton);
		articleButtons.appendChild(deleteButton);
	}

	// 댓글을 화면에 표시하기
	await loadComments(article_id);
};

// 댓글 등록 버튼
async function submitComment() {
	const urlParams = new URLSearchParams(window.location.search);
	const article_id = urlParams.get("article_id");
	const commentElement = document.getElementById("new-comment")
	const newComment = commentElement.value
	await createComment(article_id, newComment)
	commentElement.value = ""

	loadComments(article_id)
}