const header = document.querySelector('header')
const footer = document.querySelector('footer')
const main = document.querySelector('main')
const title = document.querySelector('h1')

const typewriter = (el) => {
  console.log(`typewriter`, el)
  footer.innerHTML += `<p>typewriter</p>`
  const text = el.innerHTML
  el.dataset.content = text
  const inputArr = text.split('')
  const len = inputArr.length - 1
  let count = 0
  const delay = Math.random() * 150
  el.innerHTML = ''
  const interval = setInterval(() => {
    if (count === len) {
      clearInterval(interval)
    }
    el.innerHTML += inputArr[count++]
    console.log(el.innerHTML)
  }, delay)
}

const fadeIn = (el) => {
  console.log(`fadeIn`, el)
  footer.innerHTML += `<p>fadeIn</p>`
  el.dataset.active = true
}

const resetAnimation = (el) => {
  console.log(`resetAnimation`, el)
  el.dataset.active = false
}

const runAnimation = (el) => {
  console.log(`runAnimation`, el)
  footer.innerHTML += `<p>runAnimation</p>`
  fadeIn(el)
  typewriter(el)
}

const onPause = () => {
  console.log(`onPause`)
  document.body.style.background = `alicewhite`
  resetAnimation(title)
}

const onResume = () => {
  console.log(`onResume`)
  setTimeout(() => {
    document.body.style.background = `maroon`
    fadeIn(title)
    runAnimation(title)
  }, 2000)
}

const onDeviceReady = () => {
  console.log('deviceready')
  document.body.style.background = ``
  fadeIn(title)
  runAnimation(title)
  
  const content = [
    `<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id, nostrum neque dicta corporis cupiditate ex? Pariatur error ipsum tenetur alias? Ipsa placeat exercitationem cumque maiores, facilis corporis iste earum mollitia!</p>`,
    `<p>Cumque quas nemo mollitia iste alias? Enim nulla nobis ea, quo reiciendis sit nam! Quibusdam est possimus hic minima quam facilis nulla vel. Officiis veniam iusto voluptatibus est ipsum voluptas?</p>`,
    `<p>Doloribus velit dolores perspiciatis optio at, animi a temporibus autem cum quis aperiam, ab dolor nesciunt modi repellat veritatis ipsam consequuntur adipisci aliquam ea molestias reiciendis! Ducimus fugiat minus tenetur!</p>`,
    `<p>Repellat id cupiditate vel voluptates, itaque nobis, nostrum ut impedit vero similique expedita nulla quia corporis. Similique vitae ratione iure quia! Minus dicta architecto iusto libero velit nobis excepturi quisquam!</p>`,
    `<figure><img src="./images/768.jpeg" /><figcaption>What an adorable kitten!</figcaption></figure>`,
    `<p>Reiciendis unde sunt laudantium provident? Quas sunt fuga dignissimos minus velit, aliquid quis laborum vero, id obcaecati sit sed consequatur blanditiis cum accusantium dicta reprehenderit quae illum? Ipsum, cupiditate eum.</p>`,
    `<p>Consequatur placeat, ipsum corporis blanditiis ipsa ratione quos voluptatum iusto, ea quisquam ad similique nihil esse amet, eligendi illum molestiae a nisi. Neque hic id assumenda beatae corrupti ipsa ab.</p>`,
    `<p>Porro ab ea, consequatur omnis, odit recusandae libero quae repellat pariatur asperiores non tempore. Animi consequatur quam similique, magnam officiis neque eaque excepturi. Eveniet laborum non eaque, incidunt accusantium veniam!</p>`,
    `<p>Voluptate quibusdam animi doloremque odio voluptatum harum quia unde quos, cum maiores dolores soluta esse sapiente facere magnam. Vitae itaque obcaecati necessitatibus et inventore nesciunt maiores dolorum cumque ut autem?</p>`,
    `<p>Nihil, mollitia odio corrupti consequatur distinctio ab blanditiis itaque quisquam, dolorum labore sit, nisi dolore veritatis aut. Aut earum eveniet rerum. Fuga quasi quos fugiat obcaecati facere consequatur eum quaerat.</p>`,
    `<p>Modi assumenda, iure ipsum veniam, aut libero doloremque impedit molestiae repudiandae quis praesentium optio possimus. Quasi voluptatibus fugit minima neque. Sit laborum autem minima nostrum veniam deserunt, aut id corrupti.</p>`,
  ]
  
  content.map(p => main.innerHTML += p)

}

const onLoad = () => {
  console.log('loaded')
  document.body.style.background = `wheat`
  const headerHeight = window.getComputedStyle(header, null).getPropertyValue('height')
  const footerHeight = window.getComputedStyle(footer, null).getPropertyValue('height')
  main.style.minHeight = `calc(100vh - ${headerHeight} - ${footerHeight} - 1rem)`
  document.addEventListener('deviceready', onDeviceReady, false)
  footer.innerHTML += `<p>onload&hellip;</p><p>title.dataset.active = "${title.dataset.active}"</p>`
}

document.addEventListener("pause", onPause, false);

document.addEventListener("resume", onResume, false);