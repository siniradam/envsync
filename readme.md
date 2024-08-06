# envSYNC - (Work In Progress)

Environment key:value pairs synchronizer for multiple environments.
Connects to `bonfire` (Soon) to store and retrieve environment files.


## Todo
- [x] Login to Bonfire
- [x] Store Auth
- [ ] Encrypt/decrypt values
- [ ] Store Hash Key
- [x] List Available ENV Files
- [x] Pick ENV File
- [x] List env file contents
- [x] Add env variable
- [x] Edit env variable
- [x] Delete env variable
- [ ] Push Changes
- [x] Pull File (Save locally)
- [ ] Compare ENVs


### Sample ENV Record
(Subject to change)
```jsonc
    {
      collectionId: '7foch41domlag9w',
      collectionName: 'envs',
      created: '2024-05-27 10:57:33.749Z',
      file: 'magic', // Environment file name, when pulled will be saved as .env.magic
      id: '0c2ino07r89eb7e',
      name: 'API_KEY',
      updated: '2024-05-27 10:57:33.749Z',
      user: '',
      value: '1q2w3e4r5t6y7u'
    },
```




### About Bonfire
> Bonfire is a (work in progress) tool that will store `error` and `log` files for you. 
> 
> It will also store your environment files and allow you to sync them across multiple environments.
>
> It's built with [Pocketbase]([https://](https://pocketbase.io/)).
>
