import Room from "./Room";
import GenericSprites from "../graphics/GenericSprites";
import { Sprite, Container, Point } from "pixi.js";
import BobbaEnvironment from "../BobbaEnvironment";
import MainEngine from "../graphics/MainEngine";

const CAMERA_CENTERED_OFFSET_X = 3;
const CAMERA_CENTERED_OFFSET_Y = 114;

const ROOM_SELECTED_TILE_OFFSET_X = 0;
const ROOM_SELECTED_TILE_OFFSET_Y = -3;

export default class RoomEngine {
    room: Room;
    container: Container;
    floorSprites: Sprite[];
    selectedTileSprite: Sprite | null;
    lastMousePositionX: number;
    lastMousePositionY: number;
    userSprites: SpriteDictionary;

    constructor(room: Room) {
        this.room = room;
        this.container = new Container();
        this.floorSprites = [];
        this.userSprites = {};   
        this.selectedTileSprite = null;
        this.lastMousePositionX = 0;
        this.lastMousePositionY = 0;
        this.onResize();
        this.setFloor();
        this.setSelectedTile();
        BobbaEnvironment.getGame().engine.getMainStage().addChild(this.container);
    }

    onResize() {
        this.centerCamera();
    }

    centerCamera() {
        const model = this.room.model;
        this.container.x = Math.round((MainEngine.getViewportWidth() - (GenericSprites.ROOM_TILE_WIDTH * (model.maxX - model.maxY + CAMERA_CENTERED_OFFSET_X))) / 2);
        this.container.y = Math.round((MainEngine.getViewportHeight() - ((model.maxX + model.maxY) * GenericSprites.ROOM_TILE_HEIGHT) + CAMERA_CENTERED_OFFSET_Y) / 2);
    }

    setSelectedTile() {
        const floorTexture = BobbaEnvironment.getGame().engine.getResource(GenericSprites.ROOM_SELECTED_TILE).texture;
        this.selectedTileSprite = new Sprite(floorTexture);
        this.selectedTileSprite.visible = false;
        this.container.addChild(this.selectedTileSprite);
    }

    addUserSprite(id: number, sprite: Sprite) {
        this.userSprites[id] = sprite;
        this.container.addChild(sprite);
    }

    addRoomItemSprite(sprite: Sprite) {
        this.container.addChild(sprite);
    }

    removeUserSprite(id: number) {
        const sprite = this.userSprites[id];
        if (sprite != null) {
            this.container.removeChild(sprite);
            delete(this.userSprites[id]);
        }
    }

    setFloor() {
        const floorTexture = BobbaEnvironment.getGame().engine.getResource(GenericSprites.ROOM_TILE).texture;
        this.floorSprites = [];
        const model = this.room.model;
        for (let i = 0; i < model.maxX; i++) {
            for (let j = 0; j < model.maxY; j++) {
                const tile = model.heightMap[i][j];
                if (tile > 0) {
                    const currentSprite = new Sprite(floorTexture);
                    const localPos = this.tileToLocal(i, j, 0);
                    currentSprite.x = localPos.x;
                    currentSprite.y = localPos.y;

                    this.floorSprites.push(currentSprite);
                    this.container.addChild(currentSprite);
                }
            }
        }
    }

    tileToLocal(x: number, y: number, z: number): Point {
        return new Point((x - y) * GenericSprites.ROOM_TILE_WIDTH, (x + y) * GenericSprites.ROOM_TILE_HEIGHT - (z * GenericSprites.ROOM_TILE_HEIGHT));
    }

    globalToTile(x: number, y: number): Point {
        const offsetX = this.container.x;
        const offsetY = this.container.y;

        const xminusy = (x - GenericSprites.ROOM_TILE_WIDTH - offsetX) / GenericSprites.ROOM_TILE_WIDTH;
        const xplusy = (y - offsetY) / GenericSprites.ROOM_TILE_HEIGHT;

        const tileX = Math.floor((xminusy + xplusy) / 2);
        const tileY = Math.floor((xplusy - xminusy) / 2);

        return new Point(tileX, tileY);
    }

    handleMouseMovement = (mouseX: number, mouseY: number, isDrag: boolean) => {
        const { x, y } = this.globalToTile(mouseX, mouseY);
        if (isDrag) {
            const diffX = Math.round(this.lastMousePositionX - mouseX);
            const diffY = Math.round(this.lastMousePositionY - mouseY);
            this.container.x -= diffX;
            this.container.y -= diffY;
        }
        this.lastMousePositionX = Math.round(mouseX);
        this.lastMousePositionY = Math.round(mouseY);
        this.updateSelectedTile(x, y)
    }

    handleMouseClick = (mouseX: number, mouseY: number) => {
        
    }

    handleTouchMove = (mouseX: number, mouseY: number) => {
        this.handleMouseMovement(mouseX, mouseY, true);
    }

    handleTouchStart = (mouseX: number, mouseY: number) => {
        this.handleMouseMovement(mouseX, mouseY, false);
    }

    handleMouseDoubleClick = (mouseX: number, mouseY: number) => {
        const { x, y } = this.globalToTile(mouseX, mouseY);
        const model = this.room.model;
        if (!model.isValidTile(x, y)) {
            this.centerCamera();
        }
    }

    updateSelectedTile(tileX: number, tileY: number) {
        const model = this.room.model;
        const localPos = this.tileToLocal(tileX, tileY, 0);
        if (this.selectedTileSprite != null) {
            this.selectedTileSprite.visible = model.isValidTile(tileX, tileY);
            this.selectedTileSprite.x = localPos.x + ROOM_SELECTED_TILE_OFFSET_X;
            this.selectedTileSprite.y = localPos.y + ROOM_SELECTED_TILE_OFFSET_Y;
        }
    }

    tick(delta: number) {

    }
}

interface SpriteDictionary {
    [id: number]: Sprite;
}