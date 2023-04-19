-- CreateIndex
CREATE INDEX "Comment_content_idx" ON "Comment"("content");

-- CreateIndex
CREATE INDEX "Post_title_content_idx" ON "Post"("title", "content");

-- CreateIndex
CREATE INDEX "User_email_name_idx" ON "User"("email", "name");
