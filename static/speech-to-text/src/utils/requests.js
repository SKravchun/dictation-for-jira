import {requestJira} from "@forge/bridge";

async function getIssue(issueKey) {
  const issueResponse = await requestJira(`/rest/api/3/issue/${issueKey}`);
  const response = await issueResponse.json()
  return response?.fields?.description?.content
}

export async function setDescription(text, issueKey, newDescriptionFlag) {

  const description = await getIssue(issueKey)
  const fields = {}

  fields.description = {
    "type": "doc",
    "version": 1,
    "content": []
  }

  if (text) {
    if (text && !description) {
      fields?.description?.content.push({
        "type": "paragraph",
        "content": [
          {
            "text": text.trim(),
            "type": "text"
          }
        ]
      })
    } else if (text && description) {
      description.forEach((arr) => {
        fields?.description?.content?.push(arr)
      })
      fields?.description?.content.push({
        "type": "paragraph",
        "content": [
          {
            "text": text.trim(),
            "type": "text"
          }
        ]
      })
    }


    const response = await requestJira(`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fields})
      }
    );
    newDescriptionFlag()

  }

}

export async function createComment(text, issueKey, newCommentFlag) {

  if (text) {
    const fields = {
      "body": {
        "type": "doc",
        "version": 1,
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "text": text.trim(),
                "type": "text"
              }
            ]
          }
        ]
      }
    }

    const response = await requestJira(`/rest/api/3/issue/${issueKey}/comment`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
      }
    );
    newCommentFlag()
  }

}
