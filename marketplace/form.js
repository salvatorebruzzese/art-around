const container = document.getElementById('editor-form')

const formTemplates = {
  museum: `
    <label for="name">Museum Name</label>
    <input id="name" type="text" name="name" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark placeholder-p-medium" required />
    
    <label for="description">Description</label>
    <textarea id="description" name="description" class="input input-bordered rounded-lg border-p-soft bg-white text-sm text-p-dark"></textarea>
    
    <label for="address">Address</label>
    <input id="address" type="text" name="address" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark" />
  `,
  item: `
    <label for="name">Item Name</label>
    <input id="name" type="text" name="name" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark placeholder-p-medium" required />
    
    <label for="itemType">Item Type</label>
    <select id="itemType" name="itemType" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark" required>
      <option value="artist">Artist</option>
      <option value="style">Style</option>
      <option value="technique">Technique</option>
      <option value="artwork">Artwork</option>
      <option value="other">Other</option>
    </select>
    
    <label for="license">License</label>
    <input id="license" type="text" name="license" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark" />
    
    <label for="tags">Tags (comma separated)</label>
    <input id="tags" type="text" name="tags" class="input input-bordered rounded-full border-p-soft bg-white text-sm text-p-dark" />
  `,
}

/**
 * Renders the form based on the Mongoose model requirement.
 * @param {'museum' | 'item'} modelType
 */
async function addForm(modelType) {
  if (!container) return
  container.innerHTML = ''

  const form = document.createElement('form')
  form.className = 'flex flex-col gap-3'

  if (formTemplates[modelType]) {
    form.innerHTML = formTemplates[modelType]
  } else {
    throw new Error("Invalid model type. Must strictly be 'museum' or 'item'.")
  }

  container.appendChild(form)
}

// Execution mapping
// addForm('museum')
addForm('item')
