"""
儲互社互助遊樂場 — Blender 3D 台灣園遊會小島建模＆GLB 匯出腳本
=====================================================================
使用方式（第二階段）：
1. 打開 Blender 並開啟 MCP for Blender 插件，我們可以直接透過 MCP 執行本腳本並微調鏡頭與材質；
2. 或直接在 Blender Scripting 分頁貼上執行，會自動匯出：
   C:/Users/user/Desktop/github 2/互助基金/assets/models/carnival_island.glb
匯出後重整網頁，Three.js 會自動偵測並無縫升級成這座 Blender 高質感 3D 模型！
"""
import math
import os
import bpy

EXPORT_PATH = r"C:\Users\user\Desktop\github 2\互助基金\assets\models\carnival_island.glb"

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def make_mat(name, rgba, roughness=0.65, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat

def assign_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def add_cyl(name, r, h, loc, mat, verts=28):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc)
    o = bpy.context.active_object
    o.name = name
    assign_mat(o, mat)
    return o

def add_box(name, size, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    assign_mat(o, mat)
    return o

def add_cone(name, r1, h, loc, mat, verts=4, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    assign_mat(o, mat)
    return o

def build_island():
    clear_scene()

    # Palette (Warm Taiwanese Carnival Diorama)
    m_water = make_mat("Water", (0.42, 0.78, 0.90, 1.0), 0.25)
    m_cliff = make_mat("Cliff", (0.85, 0.58, 0.38, 1.0), 0.88)
    m_grass = make_mat("Grass", (0.50, 0.78, 0.38, 1.0), 0.82)
    m_plaza = make_mat("Plaza", (0.97, 0.89, 0.73, 1.0), 0.85)
    m_wood  = make_mat("Wood",  (0.55, 0.34, 0.20, 1.0), 0.72)
    m_cream = make_mat("Cream", (0.99, 0.96, 0.90, 1.0), 0.75)
    m_red   = make_mat("Red",   (0.87, 0.33, 0.27, 1.0), 0.55)
    m_green = make_mat("Green", (0.17, 0.55, 0.42, 1.0), 0.55)
    m_blue  = make_mat("Blue",  (0.22, 0.41, 0.64, 1.0), 0.55)
    m_gold  = make_mat("Gold",  (0.95, 0.68, 0.20, 1.0), 0.35, 0.3)
    m_plum  = make_mat("Plum",  (0.52, 0.32, 0.55, 1.0), 0.55)

    # Note: Blender Z-up exports to glTF Y-up cleanly via glTF exporter!
    add_cyl("WaterRing", 11.2, 0.35, (0, 0, -0.85), m_water, 48)
    add_cyl("CliffBase", 7.4, 1.35, (0, 0, -0.60), m_cliff, 36)
    add_cyl("MeadowTop", 7.6, 0.45, (0, 0, 0.08), m_grass, 36)
    add_cyl("CenterPlaza", 2.4, 0.14, (0, 0, 0.32), m_plaza, 32)
    add_cyl("CenterPole", 0.12, 3.8, (0, 0, 2.2), m_wood, 12)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.42, location=(0, 0, 4.2))
    assign_mat(bpy.context.active_object, m_gold)

    # Booth 1: 核保快刷亭 (-4.2, -2.3 in Blender Y = -ThreeJS Z)
    bx, by = -4.2, -2.3
    add_cyl("Pad1", 1.6, 0.16, (bx, by, 0.36), m_cream)
    add_box("Counter1", (1.8, 1.15, 0.9), (bx, by, 0.85), m_wood)
    add_cone("Roof1", 1.55, 1.0, (bx, by, 2.4), m_red, 4, (0, 0, math.pi / 4))
    add_box("StampBase1", (0.7, 0.45, 0.22), (bx, by, 3.05), m_green)
    add_cyl("StampHandle1", 0.14, 0.55, (bx, by, 3.4), m_wood)

    # Booth 2: 互助配對診所 (4.1, -2.1)
    bx, by = 4.1, -2.1
    add_cyl("Pad2", 1.6, 0.16, (bx, by, 0.36), m_cream)
    add_box("ClinicHouse", (1.85, 1.45, 1.25), (bx, by, 1.02), m_cream)
    add_cone("ClinicRoof", 1.6, 0.9, (bx, by, 2.08), m_green, 4, (0, 0, math.pi / 4))
    add_box("CrossH", (0.65, 0.18, 0.22), (bx, by, 2.95), m_red)
    add_box("CrossV", (0.22, 0.18, 0.65), (bx, by, 2.95), m_red)

    # Booth 3: 理賠神探帳篷 (-3.7, 2.8)
    bx, by = -3.7, 2.8
    add_cyl("Pad3", 1.6, 0.16, (bx, by, 0.36), m_cream)
    add_cone("DetectiveTent", 1.42, 1.9, (bx, by, 1.38), m_blue, 6)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.38, minor_radius=0.07, location=(bx, by, 2.8), rotation=(math.pi / 2, 0, 0))
    assign_mat(bpy.context.active_object, m_gold)

    # Booth 4: 85 歲人生摩天輪 (0.0, 4.2)
    bx, by = 0.0, 4.2
    add_cyl("Pad4", 1.7, 0.16, (bx, by, 0.36), m_cream)
    add_cyl("WheelLegL", 0.09, 2.5, (bx - 0.6, by, 1.55), m_wood)
    add_cyl("WheelLegR", 0.09, 2.5, (bx + 0.6, by, 1.55), m_wood)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.35, minor_radius=0.08, location=(bx, by, 2.65), rotation=(math.pi / 2, 0, 0))
    assign_mat(bpy.context.active_object, m_gold)
    gondola_mats = [m_red, m_gold, m_green, m_blue, m_plum, m_red]
    for i in range(6):
        a = i * math.pi / 3
        add_box(f"Pod{i}", (0.35, 0.35, 0.35), (bx + math.cos(a) * 1.35, by, 2.65 + math.sin(a) * 1.35), gondola_mats[i])

    # Booth 5: 25 號郵筒快遞站 (3.9, 2.6)
    bx, by = 3.9, 2.6
    add_cyl("Pad5", 1.6, 0.16, (bx, by, 0.36), m_cream)
    add_box("PostHall", (1.5, 1.1, 1.35), (bx, by + 0.15, 1.05), m_plum)
    add_box("PostCap", (1.75, 1.35, 0.22), (bx, by + 0.15, 1.8), m_gold)
    add_box("TaiwanRedBox", (0.42, 0.38, 0.88), (bx - 0.38, by - 0.65, 0.82), m_red)
    add_box("TaiwanGreenBox", (0.42, 0.38, 0.88), (bx + 0.38, by - 0.65, 0.82), m_green)

    # Export GLB
    os.makedirs(os.path.dirname(EXPORT_PATH), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=EXPORT_PATH, export_format='GLB', export_yup=True)
    print("Exported Blender GLB successfully ->", EXPORT_PATH)

if __name__ == "__main__":
    build_island()
