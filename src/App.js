/* global BABYLON*/
import React, { useEffect, useState, useRef } from 'react'
import logo from './logo.svg'
import './App.css'

function App () {
  const gameScenes = useRef([])

  function doDownload (filename, scene) {
    var objectUrl
    if (objectUrl) {
      window.URL.revokeObjectURL(objectUrl)
    }

    var serializedScene = BABYLON.SceneSerializer.Serialize(scene)

    var strScene = JSON.stringify(serializedScene)

    if (filename.toLowerCase().lastIndexOf('.babylon') !== filename.length - 8 || filename.length < 9) {
      filename += '.babylon'
    }

    var blob = new Blob([strScene], { type: 'octet/stream' })

    // turn blob into an object URL; saved as a member, so can be cleaned out later
    objectUrl = (window.webkitURL || window.URL).createObjectURL(blob)

    var link = window.document.createElement('a')
    link.href = objectUrl
    link.download = filename
    var click = document.createEvent('MouseEvents')
    click.initEvent('click', true, false)
    link.dispatchEvent(click)
  }

  const resizeCanvas = () => {
    let canvas = document.getElementById('renderCanvas')
    let canvasContainer = document.querySelector('.canvas-container')
    let sceneExplorerHost = document.getElementById('scene-explorer-host')
    let inspectorHost = document.getElementById('inspector-host')

    console.log('canvasParent', {
      canvas, canvasContainer, sceneExplorerHost, inspectorHost
    })
    let canvasWidth = canvasContainer.getBoundingClientRect().width
    if (sceneExplorerHost) {
      // subtract the with of the scene explorer
      canvasWidth = canvasWidth - sceneExplorerHost.getBoundingClientRect().width
    }
    if (sceneExplorerHost) {
      // subtract the with of the inspector host
      canvasWidth = canvasWidth - inspectorHost.getBoundingClientRect().width
    }
    canvas.width = canvasWidth
    canvas.height = canvasContainer.getBoundingClientRect().height
  }

  async function setActiveGameScene (gameSceneName) {
    let oldGameScene = getActiveGameScene()
    let oldInspectorIsVisible = oldGameScene.scene.debugLayer.isVisible()
    if (oldInspectorIsVisible) {
      await oldGameScene.scene.debugLayer.hide()
    }

    let newScenes = gameScenes.current.map(s => {
      if (
        s.name === gameSceneName
      ) {
        return { ...s, active: true }
      } else {
        return { ...s, active: false }
      }
    })
    console.log('setActiveGameScene', { gameSceneName, gameScenes, newScenes })
    // update the gameScenes
    gameScenes.current = newScenes

    // restore the inspector state
    let activeGameScene = getActiveGameScene()
    if (oldInspectorIsVisible) {
      await activeGameScene.scene.debugLayer.show()
    }
  }

  async function toggleInspector () {
    console.log('upateInspector', gameScenes)
    let activeGameScene = getActiveGameScene()
    if (
      activeGameScene.scene.debugLayer.isVisible()
    ) {
      await activeGameScene.scene.debugLayer.hide()
    } else {
      await activeGameScene.scene.debugLayer.show()
    }
    resizeCanvas()
  }

  function getActiveGameScene () {
    // console.log("getActiveGameScene", gameScenes);
    return gameScenes.current.filter(s => s.active)[0]
  }

  useEffect(() => {
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas')

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true)
    // createScene function that creates and return the scene
    var createScene = function (sphereScale) {
      // create a basic BJS Scene object
      var scene = new BABYLON.Scene(engine)

      // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
      var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene)

      // target the camera to scene origin
      camera.setTarget(BABYLON.Vector3.Zero())

      // attach the camera to the canvas
      camera.attachControl(canvas, false)

      // create a basic light, aiming 0,1,0 - meaning, to the sky
      var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene)

      // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
      var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene)
      sphere.scaling.x = sphereScale
      sphere.scaling.y = sphereScale
      sphere.scaling.z = sphereScale

      // move the sphere upward 1/2 of its height
      sphere.position.y = 1

      // create a built-in "ground" shape;
      var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene)

      // return the created scene
      return scene
    }

    // call the createScene function
    var scene_1 = createScene(1)
    var scene_2 = createScene(2)

    // save the scene
    gameScenes.current = [
      {
        name: 'scene_1', scene: scene_1, active: true
      },
      {
        name: 'scene_2', scene: scene_2, active: false
      }
    ]

    resizeCanvas()

    // run the render loop
    engine.runRenderLoop(() => {
      let activeGameScene = getActiveGameScene().scene
      activeGameScene.render()
    })

    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
      engine.resize()
      resizeCanvas()
    })
  }, [])
  return (
    <div className="App">
      <div className={'controls'}>
        <button onClick={() => {
          // doDownload('scene-from-react.babylon', scene)
        }}>
          save scene
        </button>
        <button onClick={async () => {
          let activeGameScene = getActiveGameScene()
          if (activeGameScene.name === 'scene_1') {
            await setActiveGameScene('scene_2')
          } else {
            await setActiveGameScene('scene_1')
          }
        }}>
          toggle scene
        </button>
        <button onClick={async () => {
          await toggleInspector()
        }}>
          toggle inspector
        </button>
      </div>
      <div className={'babylon'}>
        <div className={'canvas-container'}>
          <canvas id="renderCanvas"></canvas>
        </div>
      </div>
    </div>
  )
}

export default App
