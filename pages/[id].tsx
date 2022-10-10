import { GetStaticProps, NextPage } from "next";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { promises as fs } from "fs";
import path from "path";

export async function getStaticPaths() {
  // test.md will be rendered beforehand
  return {
    paths: [{ params: { id: "test" } }],
    fallback: true, // other ids will be dynamically rendered server-side
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const id = params?.id ?? "404";
  // ignore subpaths if there is more than one layer of subpath
  // display 404 if id is undefined
  const ids = typeof id === "string" ? id : id[0] ?? "404";
  const processor = unified().use(remarkParse).use(remarkHtml);
  // try to read file; display 404.md if there is exception
  let read: string;
  try {
    read = await fs.readFile(path.join(process.cwd(), ids + ".md"), "utf8");
  } catch {
    read = await fs.readFile(path.join(process.cwd(), "404.md"), "utf8");
  }
  const processed = await processor.process(read);
  return {
    props: {
      content: String(processed),
    },
  };
};

const Post: NextPage<{ content: string }> = (props) => {
  return <div dangerouslySetInnerHTML={{ __html: props.content }}></div>;
};

export default Post;
